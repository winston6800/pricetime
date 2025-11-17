"use client"

import { useState, useEffect, useMemo } from "react"
import { FaEdit, FaPlus } from "react-icons/fa"
import { fetchUserData, saveUserData, fetchTasks, fetchIncomeEntries, createIncomeEntry } from '@/lib/api-helpers'

interface OutcomesDashboardProps {
  isPro?: boolean // For now, we'll show it to everyone, gate later
}

// Format large numbers with shorthand (e.g., $50K, $1.2M)
const formatMoney = (amount: number): string => {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`
  } else {
    return `$${amount.toFixed(2)}`
  }
}

export default function OutcomesDashboard({ isPro = true }: OutcomesDashboardProps) {
  const [goalTarget, setGoalTarget] = useState<number | null>(null)
  const [goalMotivation, setGoalMotivation] = useState<string>("")
  const [goalCreatedAt, setGoalCreatedAt] = useState<number | null>(null)
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [tasks, setTasks] = useState<any[]>([])
  const [incomeEntries, setIncomeEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [amountInput, setAmountInput] = useState<string>("")
  const [noteInput, setNoteInput] = useState<string>("")
  const [pendingAmount, setPendingAmount] = useState<number>(0)
  const [pendingNote, setPendingNote] = useState<string>("")

  // Load goals, tasks, and income entries
  useEffect(() => {
    async function loadData() {
      try {
        const userData = await fetchUserData()
        setGoalTarget(userData.goalTarget || null)
        setGoalMotivation(userData.goalMotivation || "")
        setGoalCreatedAt(userData.goalCreatedAt ? Number(userData.goalCreatedAt) : null)

        const [taskList, incomeList] = await Promise.all([
          fetchTasks(),
          fetchIncomeEntries()
        ])
        setTasks(taskList)
        setIncomeEntries(incomeList)
      } catch (error) {
        console.error('Error loading outcomes data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Calculate days since goal creation
  const daysSinceGoal = useMemo(() => {
    if (!goalCreatedAt) return 0
    const now = Date.now()
    const diff = now - goalCreatedAt
    return Math.floor(diff / (24 * 60 * 60 * 1000))
  }, [goalCreatedAt])

  // Calculate earnings since goal creation (tasks + manual entries)
  const earningsData = useMemo(() => {
    if (!goalCreatedAt) {
      return {
        totalEarned: 0,
        effectiveRate: 0,
        topTask: null,
        hours: 0,
      }
    }

    const cutoffDate = new Date(goalCreatedAt)

    const relevantTasks = tasks.filter((t: any) => {
      const taskDate = new Date(Number(t.timestamp))
      return taskDate >= cutoffDate
    })

    const relevantIncome = incomeEntries.filter((e: any) => {
      const entryDate = new Date(Number(e.timestamp))
      return entryDate >= cutoffDate
    })

    const taskEarnings = relevantTasks.reduce((sum: number, t: any) => sum + (t.valueEarned || 0), 0)
    const incomeEarnings = relevantIncome.reduce((sum: number, e: any) => sum + (e.amount || 0), 0)
    const totalEarned = taskEarnings + incomeEarnings

    const totalTime = relevantTasks.reduce((sum: number, t: any) => sum + (t.duration || 0), 0)
    const hours = totalTime / 3600
    const effectiveRate = hours > 0 ? totalEarned / hours : 0

    // Find top-valued task
    const topTask = relevantTasks.reduce((top: any, t: any) => {
      return (t.valueEarned || 0) > (top?.valueEarned || 0) ? t : top
    }, null)

    return {
      totalEarned,
      effectiveRate,
      topTask,
      hours,
    }
  }, [tasks, incomeEntries, goalCreatedAt])

  const handleSaveGoal = async () => {
    try {
      const now = Date.now()
      // If goal doesn't exist yet, set goalCreatedAt. If editing existing goal, keep existing goalCreatedAt
      const newGoalCreatedAt = goalCreatedAt || now
      
      // Save goal - this returns the updated userData
      const savedData = await saveUserData({
        goalTarget,
        goalMotivation,
        goalCreatedAt: newGoalCreatedAt,
      })
      
      // Update state from the saved response (defensive - handle any response format)
      try {
        if (savedData) {
          setGoalTarget(savedData.goalTarget ?? goalTarget)
          setGoalMotivation(savedData.goalMotivation ?? goalMotivation)
          if (savedData.goalCreatedAt) {
            setGoalCreatedAt(Number(savedData.goalCreatedAt))
          } else if (newGoalCreatedAt) {
            setGoalCreatedAt(newGoalCreatedAt)
          }
        }
      } catch (stateError) {
        // If state update fails, log but don't block - goal is still saved
        console.warn('State update warning:', stateError)
      }
      
      // Close modal on success
      setShowGoalModal(false)
    } catch (error) {
      console.error('Error saving goal:', error)
      // Only show error if save actually failed (not just a reload issue)
      // Since saveUserData throws on failure, if we're here, the save failed
      alert('Failed to save goal. Please try again.')
    }
  }

  const handleAddMoneyClick = () => {
    setShowAddMoneyModal(true)
  }

  const handleAddMoneySubmit = () => {
    const amount = parseFloat(amountInput)
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount greater than 0')
      return
    }
    setPendingAmount(amount)
    setPendingNote(noteInput)
    setShowAddMoneyModal(false)
    setShowConfirmModal(true)
  }

  const handleConfirmAddMoney = async () => {
    try {
      await createIncomeEntry(pendingAmount, pendingNote || undefined)
      // Reload income entries
      const updatedIncome = await fetchIncomeEntries()
      setIncomeEntries(updatedIncome)
      setShowConfirmModal(false)
      setAmountInput("")
      setNoteInput("")
      setPendingAmount(0)
      setPendingNote("")
    } catch (error) {
      console.error('Error adding income entry:', error)
      alert('Failed to add income entry')
    }
  }

  const handleCancelConfirm = () => {
    setShowConfirmModal(false)
    setPendingAmount(0)
    setPendingNote("")
  }

  if (!isPro) {
    return null // Hide for non-Pro users (gate later)
  }

  if (loading) {
    return (
      <div style={{
        maxWidth: 400,
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 2px 12px #0001",
        padding: 24,
        flex: 1,
        minWidth: 300,
      }}>
        <div style={{ color: "#666", fontSize: 14 }}>Loading...</div>
      </div>
    )
  }

  const hasGoal = goalTarget !== null && goalTarget > 0
  const progress = hasGoal ? Math.min((earningsData.totalEarned / goalTarget) * 100, 100) : 0
  const remaining = hasGoal ? Math.max(goalTarget - earningsData.totalEarned, 0) : 0

  return (
    <>
      <div style={{
        maxWidth: 400,
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 2px 12px #0001",
        padding: 24,
        flex: 1,
        minWidth: 300,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontWeight: 700, fontSize: 18 }}>Outcomes</h3>
          {hasGoal && goalCreatedAt && (
            <div style={{ fontSize: 12, color: "#666", fontWeight: 600 }}>
              Day {daysSinceGoal}
            </div>
          )}
        </div>

        {!hasGoal ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <p style={{ color: "#666", fontSize: 14, marginBottom: 16 }}>
              Track the money that retires your parents, pays off debt, or takes her abroad.
            </p>
            <button
              onClick={() => setShowGoalModal(true)}
              style={{
                background: "#3498db",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "8px 16px",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Set a money goal
            </button>
          </div>
        ) : (
          <>
            {/* Large earnings figure */}
            <div style={{
              fontSize: 36,
              fontWeight: 700,
              color: "#e74c3c",
              textAlign: "center",
              marginBottom: 12,
            }}>
              {formatMoney(earningsData.totalEarned)}
            </div>

            {/* Goal progress bar */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: "#666" }}>Earned vs Target</span>
                <span style={{ fontSize: 12, color: "#666", fontWeight: 600 }}>
                  {formatMoney(earningsData.totalEarned)} / {goalTarget ? formatMoney(goalTarget) : '$0'}
                </span>
              </div>
              <div style={{
                width: "100%",
                height: 8,
                background: "#f1f1f1",
                borderRadius: 4,
                overflow: "hidden",
              }}>
                <div style={{
                  width: `${progress}%`,
                  height: "100%",
                  background: "#3498db",
                  transition: "width 0.3s",
                }} />
              </div>
              <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>
                {formatMoney(remaining)} remaining
              </div>
            </div>

            {/* Motivation line */}
            {goalMotivation && (
              <div style={{
                fontSize: 13,
                color: "#666",
                textAlign: "center",
                marginBottom: 16,
                fontStyle: "italic",
              }}>
                {goalMotivation}
              </div>
            )}

            {/* Quick stats row */}
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <div style={{
                flex: 1,
                background: "#f8f9fa",
                borderRadius: 6,
                padding: 10,
                textAlign: "center",
              }}>
                <div style={{ fontSize: 10, color: "#666", marginBottom: 4 }}>Effective Rate</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#222" }}>
                  ${earningsData.effectiveRate.toFixed(0)}/hr
                </div>
              </div>
              <div style={{
                flex: 1,
                background: "#f8f9fa",
                borderRadius: 6,
                padding: 10,
                textAlign: "center",
              }}>
                <div style={{ fontSize: 10, color: "#666", marginBottom: 4 }}>Top Task</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#222", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {earningsData.topTask ? (
                    <>
                      {earningsData.topTask.name.slice(0, 15)}
                      {earningsData.topTask.name.length > 15 ? "..." : ""}
                      <br />
                      <span style={{ color: "#e74c3c", fontSize: 11 }}>
                        ${(earningsData.topTask.valueEarned || 0).toFixed(0)}
                      </span>
                    </>
                  ) : (
                    "—"
                  )}
                </div>
              </div>
            </div>

            {/* Add Money button */}
            <button
              onClick={handleAddMoneyClick}
              style={{
                width: "100%",
                marginTop: 12,
                padding: "8px",
                background: "#28a745",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <FaPlus size={12} />
              Add Money
            </button>

            {/* Edit goal button */}
            <button
              onClick={() => setShowGoalModal(true)}
              style={{
                width: "100%",
                marginTop: 8,
                padding: "6px",
                background: "none",
                border: "1px solid #ddd",
                borderRadius: 6,
                fontSize: 12,
                color: "#666",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <FaEdit size={12} />
              Edit Goal
            </button>
          </>
        )}
      </div>

      {/* Goal Setup Modal */}
      {showGoalModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}
        onClick={() => setShowGoalModal(false)}
        >
          <div style={{
            background: "#fff",
            borderRadius: 12,
            padding: 24,
            maxWidth: 400,
            width: "90%",
            boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 16px 0", fontWeight: 700, fontSize: 18 }}>Set Money Goal</h3>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, color: "#666", marginBottom: 4 }}>
                Target Amount ($)
              </label>
              <input
                type="number"
                value={goalTarget || ""}
                onChange={(e) => setGoalTarget(e.target.value ? parseFloat(e.target.value) : null)}
                placeholder="5000"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  fontSize: 14,
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, color: "#666", marginBottom: 4 }}>
                Why? (e.g., "Retire Mom & Dad", "Siblings Trip to Japan")
              </label>
              <input
                type="text"
                value={goalMotivation}
                onChange={(e) => setGoalMotivation(e.target.value)}
                placeholder="Retire Mom & Dad"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  fontSize: 14,
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setShowGoalModal(false)}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: "#f1f1f1",
                  color: "#333",
                  border: "none",
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveGoal}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: "#3498db",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Save Goal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Money Modal */}
      {showAddMoneyModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}
        onClick={() => {
          setShowAddMoneyModal(false)
          setAmountInput("")
          setNoteInput("")
        }}
        >
          <div style={{
            background: "#fff",
            borderRadius: 12,
            padding: 24,
            maxWidth: 400,
            width: "90%",
            boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 16px 0", fontWeight: 700, fontSize: 18 }}>Add Money</h3>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, color: "#666", marginBottom: 4 }}>
                Amount ($)
              </label>
              <input
                type="number"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                placeholder="0.00"
                step="0.01"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  fontSize: 14,
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, color: "#666", marginBottom: 4 }}>
                Note (optional)
              </label>
              <input
                type="text"
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="e.g., Client payment, Freelance work"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  fontSize: 14,
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => {
                  setShowAddMoneyModal(false)
                  setAmountInput("")
                  setNoteInput("")
                }}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: "#f1f1f1",
                  color: "#333",
                  border: "none",
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddMoneySubmit}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: "#3498db",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1001,
        }}
        onClick={handleCancelConfirm}
        >
          <div style={{
            background: "#fff",
            borderRadius: 12,
            padding: 24,
            maxWidth: 400,
            width: "90%",
            boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 16px 0", fontWeight: 700, fontSize: 18 }}>Confirm</h3>
            
            <p style={{ marginBottom: 16, fontSize: 14, color: "#333" }}>
              Add ${pendingAmount.toFixed(2)} to your goal?
            </p>
            {pendingNote && (
              <p style={{ marginBottom: 16, fontSize: 12, color: "#666", fontStyle: "italic" }}>
                Note: {pendingNote}
              </p>
            )}
            <p style={{ marginBottom: 20, fontSize: 12, color: "#666" }}>
              This will update your progress.
            </p>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={handleCancelConfirm}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: "#f1f1f1",
                  color: "#333",
                  border: "none",
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAddMoney}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: "#28a745",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
