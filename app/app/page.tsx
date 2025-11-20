"use client"

import { useState, useRef, useEffect, useMemo, memo } from "react"
import { useClerk, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { FaMinus, FaPaperPlane, FaPlay, FaPause, FaPlus, FaSearch, FaChevronDown, FaChevronUp, FaSignOutAlt } from "react-icons/fa"
import { MdDelete } from "react-icons/md"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchUserData, saveUserData, fetchTasks, createTask, deleteTask, fetchLoops, saveLoop, deleteLoop, updateTask, getSubscriptionStatus, createCheckoutSession } from '@/lib/api-helpers';
import OutcomesDashboard from '@/components/OutcomesDashboard';

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")
  const s = (seconds % 60).toString().padStart(2, "0")
  return `${m}:${s}`
}

const formatTimestamp = (timestamp: number) => {
  return new Date(timestamp).toLocaleString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

interface OpenLoop {
  id: number
  name: string
  time: number
}

interface Loop {
  id: number
  title: string
  isChecked: boolean
  time: number
  isActive: boolean
  rate: number // $/hr
}

interface Task {
  id?: string
  name: string
  amount: string
  timestamp: number
  duration?: number
  category: string
  valueEarned?: number
}

// Memoized chart component to prevent unnecessary re-renders
const MemoizedChart = memo(({ chartData, showMinerals }: { chartData: any[]; showMinerals: boolean }) => (
  <ResponsiveContainer width="100%" height={250}>
    <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="day" />
      <YAxis allowDecimals={false} />
      <Tooltip />
      {showMinerals ? (
        <>
          <Line type="monotone" dataKey="rock" stroke="#e74c3c" strokeWidth={3} dot={{ r: 4 }} name="Rocks" isAnimationActive={false} />
          <Line type="monotone" dataKey="pebble" stroke="#f39c12" strokeWidth={3} dot={{ r: 4 }} name="Pebbles" isAnimationActive={false} />
          <Line type="monotone" dataKey="sand" stroke="#95a5a6" strokeWidth={3} dot={{ r: 4 }} name="Sand" isAnimationActive={false} />
        </>
      ) : (
        <Line type="monotone" dataKey="count" stroke="#3498db" strokeWidth={3} dot={{ r: 4 }} isAnimationActive={false} />
      )}
    </LineChart>
  </ResponsiveContainer>
));

function OpenLoopsDashboard({ mainTaskActive, pauseMainTask }: { mainTaskActive: boolean; pauseMainTask: () => void }) {
  const [loops, setLoops] = useState<Loop[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("burnEngine_openLoopsDashboard")
      return saved ? JSON.parse(saved) : []
    }
    return []
  })
  const [input, setInput] = useState("")
  const [minimized, setMinimized] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("burnEngine_openLoopsMinimized")
      return saved ? JSON.parse(saved) : true // Default to minimized (per spec)
    }
    return true // Default to minimized (per spec)
  })
  const [activeId, setActiveId] = useState<number | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Save loops to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("burnEngine_openLoopsDashboard", JSON.stringify(loops))
    }
  }, [loops])

  // Save minimized state to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("burnEngine_openLoopsMinimized", JSON.stringify(minimized))
    }
  }, [minimized])

  // Timer effect for active loop
  useEffect(() => {
    if (activeId == null) return
    const interval = setInterval(() => {
      setLoops((ls) => ls.map((l) => (l.id === activeId ? { ...l, time: l.time + 1 } : l)))
    }, 1000)
    return () => clearInterval(interval)
  }, [activeId])

  // Auto-expand textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px"
    }
  }, [input])

  const handleAdd = () => {
    if (input.trim()) {
      setLoops([
        {
          id: Date.now(),
          title: input,
          isChecked: false,
          time: 0,
          isActive: false,
          rate: 1000, // $/hr default
        },
        ...loops,
      ])
      setInput("")
    }
  }

  const handlePlayPause = (id: number) => {
    if (activeId === id) {
      setLoops((ls) => ls.map((l) => (l.id === id ? { ...l, isActive: false } : l)))
      setActiveId(null)
    } else {
      pauseMainTask() // Pause main task if running
      setLoops((ls) => ls.map((l) => (l.id === id ? { ...l, isActive: true } : { ...l, isActive: false })))
      setActiveId(id)
    }
  }

  const handleCheck = (id: number) => {
    setLoops((ls) => ls.filter((l) => l.id !== id))
  }

  const calcCost = (loop: Loop) => ((loop.time / 3600) * loop.rate).toFixed(2)

  return (
    <div
      style={{
        maxWidth: 400,
        background: "#faf9f7",
        borderRadius: 12,
        boxShadow: "0 2px 12px #0001",
        padding: 20,
        margin: "2rem auto",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontWeight: 700, fontSize: 18, color: "#222" }}>Open Loops</span>
        <button
          onClick={() => setMinimized((m) => !m)}
          style={{
            background: minimized ? "#f1f1f1" : "#eee",
            border: "none",
            borderRadius: 8,
            boxShadow: "0 1px 4px #0001",
            fontSize: 18,
            cursor: "pointer",
            color: "#888",
            padding: 6,
            transition: "background 0.2s",
          }}
          title={minimized ? "Expand" : "Minimize"}
        >
          {minimized ? <FaPlus /> : <FaMinus />}
        </button>
      </div>
      {!minimized && (
        <>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 16 }}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Add a distraction or open loop"
              rows={1}
              style={{
                flex: 1,
                resize: "none",
                border: "1px solid #ddd",
                borderRadius: 6,
                padding: "8px 10px",
                fontSize: 15,
                minHeight: 36,
                maxHeight: 80,
                overflow: "auto",
                background: "#fff",
              }}
            />
            <button
              onClick={handleAdd}
              style={{
                background: "#eee",
                border: "none",
                borderRadius: "50%",
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                marginTop: 2,
              }}
              title="Add"
            >
              <FaPaperPlane size={14} />
            </button>
          </div>
          <div>
            {loops.map((loop) => (
              <div
                key={loop.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#fff",
                  borderRadius: 8,
                  marginBottom: 10,
                  padding: "8px 10px",
                  boxShadow: "0 1px 2px #0001",
                }}
              >
                <input
                  type="checkbox"
                  checked={loop.isChecked}
                  onChange={() => handleCheck(loop.id)}
                  style={{ marginRight: 6, cursor: "pointer" }}
                />
                <span style={{ flex: 1, fontWeight: 500, fontSize: 15, color: "#222", whiteSpace: "pre-line" }}>
                  {loop.title}
                </span>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", minWidth: 70 }}>
                  <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600, fontSize: 14 }}>
                    {formatTime(loop.time)}
                  </span>
                  <span style={{ color: "#e74c3c", fontWeight: 700, fontSize: 13 }}>${calcCost(loop)} spent</span>
                </div>
                <button
                  onClick={() => handlePlayPause(loop.id)}
                  style={{
                    background: loop.isActive ? "#e0e7ff" : "#222",
                    color: loop.isActive ? "#222" : "#fff",
                    border: "none",
                    borderRadius: "50%",
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginLeft: 8,
                    fontSize: 16,
                    cursor: "pointer",
                    boxShadow: loop.isActive ? "0 0 8px #a5b4fc" : undefined,
                  }}
                  title={loop.isActive ? "Pause" : "Play"}
                  disabled={mainTaskActive && !loop.isActive}
                >
                  {loop.isActive ? <FaPause /> : <FaPlay />}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// Helper functions for date grouping
const getDateGroup = (timestamp: number): string => {
  const taskDate = new Date(timestamp)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const thisWeekStart = new Date(today)
  thisWeekStart.setDate(today.getDate() - today.getDay())
  const lastWeekStart = new Date(thisWeekStart)
  lastWeekStart.setDate(lastWeekStart.getDate() - 7)
  const lastWeekEnd = new Date(thisWeekStart)
  lastWeekEnd.setDate(lastWeekEnd.getDate() - 1)

  const taskDateOnly = new Date(taskDate)
  taskDateOnly.setHours(0, 0, 0, 0)

  if (taskDateOnly.getTime() === today.getTime()) return "Today"
  if (taskDateOnly.getTime() === yesterday.getTime()) return "Yesterday"
  if (taskDateOnly >= thisWeekStart && taskDateOnly < today) return "This Week"
  if (taskDateOnly >= lastWeekStart && taskDateOnly < thisWeekStart) return "Last Week"
  return "Older"
}

const formatDateHeader = (group: string, tasks: Task[]): string => {
  if (tasks.length === 0) return group
  const dates = tasks.map(t => new Date(t.timestamp).toLocaleDateString())
  if (group === "Today" || group === "Yesterday") {
    return `${group} (${tasks.length} task${tasks.length !== 1 ? 's' : ''})`
  }
  return `${group} (${tasks.length} task${tasks.length !== 1 ? 's' : ''})`
}

export default function BurnEngine() {
  // Hydration-safe state initialization
  const [hourlyRate, setHourlyRate] = useState<number>(90);
  const [timer, setTimer] = useState<number>(0);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [currentTask, setCurrentTask] = useState<string>("");
  const [currentTaskCategory, setCurrentTaskCategory] = useState<string>("rock");
  const [taskHistory, setTaskHistory] = useState<Task[]>([]);
  const [showMinerals, setShowMinerals] = useState<boolean>(true);
  const [taskHistoryMinimized, setTaskHistoryMinimized] = useState<boolean>(false);
  const [loginStreak, setLoginStreak] = useState<number>(0);
  const [lastLoginDate, setLastLoginDate] = useState<string>("");
  const [valueEarned, setValueEarned] = useState<string>("");
  const [categoryEditTaskId, setCategoryEditTaskId] = useState<string | null>(null);
  const [categoryEditValue, setCategoryEditValue] = useState<string>("rock");
  const [isPro, setIsPro] = useState<boolean>(false);
  const startTimeRef = useRef<number | null>(null);

  // Task History filters and sorting
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [tasksPerPage, setTasksPerPage] = useState<number>(25);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(["Today", "Yesterday", "This Week"]));

  // Progress Dashboard
  const [timeframe, setTimeframe] = useState<"week" | "month">("week");

  // Load subscription status
  const loadSubscriptionStatus = async () => {
    try {
      const subscription = await getSubscriptionStatus();
      setIsPro(subscription.isPro || false);
      return subscription.isPro || false;
    } catch (error) {
      console.error('Error loading subscription:', error);
      setIsPro(false);
      return false;
    }
  };

  // On mount, load state from API
  useEffect(() => {
    async function loadData() {
      try {
        // Load user data
        const userData = await fetchUserData();
        setHourlyRate(userData.hourlyRate || 90);
        setCurrentTask(userData.currentTask || '');
        setCurrentTaskCategory(userData.category || 'rock');
        setTimer(userData.timer || 0);
        setShowMinerals(userData.showMinerals ?? true);
        setTaskHistoryMinimized(userData.taskHistoryMinimized ?? false);
        setLoginStreak(userData.loginStreak || 1);
        setLastLoginDate(userData.lastLoginDate || new Date().toDateString());
        
        // Set timer start time if timer is running
        if (userData.timerStartTime) {
          startTimeRef.current = Number(userData.timerStartTime);
        } else if (userData.timer > 0) {
          // If timer has value but no start time, calculate it
          startTimeRef.current = Date.now() - (userData.timer * 1000);
        }
        
        // Load task history
        const tasks = await fetchTasks();
        setTaskHistory(tasks.map((task: any) => ({
          id: task.id,
          name: task.name,
          amount: task.cost,
          timestamp: Number(task.timestamp),
          duration: task.duration,
          category: task.category,
          valueEarned: task.valueEarned || 0,
        })));
        
        // Load subscription status
        await loadSubscriptionStatus();
        
        setHasLoaded(true);
      } catch (error) {
        console.error('Error loading data:', error);
        setHasLoaded(true); // Still set loaded to show UI
      }
    }
    loadData();
  }, []);

  // Check if user just upgraded (from URL params)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('upgraded') === 'true') {
      // Refresh subscription status after upgrade
      setTimeout(() => {
        loadSubscriptionStatus().then((isPro) => {
          if (isPro) {
            // Remove query param and show success
            window.history.replaceState({}, '', '/app');
            alert('Welcome to Pro! 🎉');
          }
        });
      }, 2000); // Wait 2 seconds for webhook to process
    }
  }, []);

  // Start timer interval only after timer is loaded
  useEffect(() => {
    if (!hasLoaded) return;
    // Only set startTimeRef if it's not already set (from data load)
    if (startTimeRef.current === null && timer > 0) {
      startTimeRef.current = Date.now() - timer * 1000;
    }
    const interval = setInterval(() => {
      if (startTimeRef.current) {
        const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setTimer(elapsedSeconds);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [hasLoaded]);

  // Save timer to API every 10 seconds (per spec)
  useEffect(() => {
    if (!hasLoaded) return;
    const interval = setInterval(async () => {
      try {
        await saveUserData({
          timer,
          timerStartTime: startTimeRef.current,
        });
      } catch (error) {
        console.error('Error saving timer:', error);
      }
    }, 10000); // Save timer every 10 seconds
    return () => clearInterval(interval);
  }, [timer, hasLoaded]);

  // Save user settings to API whenever they change (debounced 2 seconds per spec)
  useEffect(() => {
    if (!hasLoaded) return;
    const timeout = setTimeout(async () => {
      try {
        await saveUserData({
          hourlyRate,
          currentTask,
          category: currentTaskCategory,
          showMinerals,
          taskHistoryMinimized,
        });
      } catch (error) {
        console.error('Error saving user data:', error);
      }
    }, 2000); // Debounce saves by 2 seconds
    return () => clearTimeout(timeout);
  }, [hourlyRate, currentTask, currentTaskCategory, showMinerals, taskHistoryMinimized, hasLoaded])

  const moneySpent = ((timer / 3600) * hourlyRate).toFixed(2)
  const perMinuteSpent = (hourlyRate / 60).toFixed(2)
  const perSecondSpent = (hourlyRate / 3600).toFixed(2)

  // Add a function to pause the main task
  const pauseMainTask = () => {
    // Timer is perpetual, so we don't actually pause it
  }

  const handleReset = async () => {
    setTimer(0);
    startTimeRef.current = null;
    try {
      await saveUserData({
        timer: 0,
        timerStartTime: null,
      });
    } catch (error) {
      console.error('Error resetting timer:', error);
    }
  }

  // Handle finishing a task
  const handleFinishTask = async () => {
    if (currentTask.trim()) {
      try {
        await createTask({
          name: currentTask,
          category: currentTaskCategory,
          cost: moneySpent,
          duration: timer,
          valueEarned: valueEarned ? parseFloat(valueEarned) : 0,
        });
        
        // Reload task history
        const tasks = await fetchTasks();
        setTaskHistory(tasks.map((task: any) => ({
          id: task.id,
          name: task.name,
          amount: task.cost,
          timestamp: Number(task.timestamp),
          duration: task.duration,
          category: task.category,
          valueEarned: task.valueEarned || 0,
        })));
      } catch (error) {
        console.error('Error finishing task:', error);
      }
    }
    setCurrentTask("");
    setValueEarned("");
    setTimer(0);
    startTimeRef.current = Date.now();
    try {
      await saveUserData({
        currentTask: '',
        timer: 0,
        timerStartTime: Date.now(),
      });
    } catch (error) {
      console.error('Error saving after finish task:', error);
    }
  };

  const handleCategoryChange = async (taskId: string, newCategory: string) => {
    if (!taskId) return;
    setCategoryEditValue(newCategory);
    try {
      await updateTask(taskId, { category: newCategory });
      const tasks = await fetchTasks();
      setTaskHistory(tasks.map((task: any) => ({
        id: task.id,
        name: task.name,
        amount: task.cost,
        timestamp: Number(task.timestamp),
        duration: task.duration,
        category: task.category,
        valueEarned: task.valueEarned || 0,
      })));
    } catch (error) {
      console.error('Error updating task category:', error);
    } finally {
      setCategoryEditTaskId(null);
    }
  };

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = taskHistory.filter(task => {
      const matchesSearch = searchQuery === "" || task.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || task.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return a.timestamp - b.timestamp;
        case "highest-cost":
          return parseFloat(b.amount) - parseFloat(a.amount);
        case "longest-duration":
          return (b.duration || 0) - (a.duration || 0);
        case "newest":
        default:
          return b.timestamp - a.timestamp;
      }
    });

    return filtered;
  }, [taskHistory, searchQuery, categoryFilter, sortBy]);

  // Group tasks by date
  const groupedTasks = useMemo(() => {
    const groups: Record<string, Task[]> = {};
    filteredAndSortedTasks.forEach(task => {
      const group = getDateGroup(task.timestamp);
      if (!groups[group]) groups[group] = [];
      groups[group].push(task);
    });
    return groups;
  }, [filteredAndSortedTasks]);

  // Calculate daily stats for a group
  const getGroupStats = (tasks: Task[]) => {
    const totalCost = tasks.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const totalTime = tasks.reduce((sum, t) => sum + (t.duration || 0), 0);
    const hours = Math.floor(totalTime / 3600);
    const minutes = Math.floor((totalTime % 3600) / 60);
    return { count: tasks.length, cost: totalCost, hours, minutes };
  }

  // Progress Dashboard calculations
  const dashboardData = useMemo(() => {
    const now = new Date();
    const cutoffDate = timeframe === "week" 
      ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const relevantTasks = taskHistory.filter(t => new Date(t.timestamp) >= cutoffDate);
    const previousPeriodTasks = taskHistory.filter(t => {
      const taskDate = new Date(t.timestamp);
      const previousCutoff = timeframe === "week"
        ? new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
        : new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      return taskDate >= previousCutoff && taskDate < cutoffDate;
    });

    const totalTasks = relevantTasks.length;
    const totalTime = relevantTasks.reduce((sum, t) => sum + (t.duration || 0), 0);
    const totalCost = relevantTasks.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const hours = Math.floor(totalTime / 3600);
    const minutes = Math.floor((totalTime % 3600) / 60);

    const categoryBreakdown = {
      rock: relevantTasks.filter(t => t.category === "rock").length,
      pebble: relevantTasks.filter(t => t.category === "pebble").length,
      sand: relevantTasks.filter(t => t.category === "sand").length,
    };

    const categoryTime = {
      rock: relevantTasks.filter(t => t.category === "rock").reduce((sum, t) => sum + (t.duration || 0), 0),
      pebble: relevantTasks.filter(t => t.category === "pebble").reduce((sum, t) => sum + (t.duration || 0), 0),
      sand: relevantTasks.filter(t => t.category === "sand").reduce((sum, t) => sum + (t.duration || 0), 0),
    };

    const trend = previousPeriodTasks.length > 0
      ? ((totalTasks - previousPeriodTasks.length) / previousPeriodTasks.length) * 100
      : 0;

    // Find best day/week
    const dayGroups: Record<string, number> = {};
    relevantTasks.forEach(task => {
      const dayKey = new Date(task.timestamp).toLocaleDateString();
      dayGroups[dayKey] = (dayGroups[dayKey] || 0) + 1;
    });
    const bestDay = Object.entries(dayGroups).sort((a, b) => b[1] - a[1])[0];

    return {
      totalTasks,
      totalTime: { hours, minutes, seconds: totalTime },
      totalCost,
      categoryBreakdown,
      categoryTime,
      trend,
      bestDay: bestDay ? { date: bestDay[0], count: bestDay[1] } : null,
      averagePerDay: timeframe === "week" ? (totalTasks / 7).toFixed(1) : (totalTasks / 30).toFixed(1),
    };
  }, [taskHistory, timeframe]);

  // Prepare data for cumulative line chart with unaccounted time
  const chartData = useMemo(() => {
    // Generate historical dates (last 7 days) with 0 values
    const historicalDates: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      historicalDates.push(date.toLocaleDateString());
    }

    if (showMinerals) {
      // Group by day and category for minerals view
      const dayCategoryCounts: Record<string, { rock: number; pebble: number; sand: number; unaccountedHours: number; unaccountedCost: number }> = {};
      
      // Initialize all historical dates with 0 values
      historicalDates.forEach(day => {
        dayCategoryCounts[day] = { rock: 0, pebble: 0, sand: 0, unaccountedHours: 0, unaccountedCost: 0 };
      });
      
      // Add actual task data
      taskHistory.forEach((task) => {
        const day = new Date(task.timestamp).toLocaleDateString();
        if (!dayCategoryCounts[day]) {
          dayCategoryCounts[day] = { rock: 0, pebble: 0, sand: 0, unaccountedHours: 0, unaccountedCost: 0 };
        }
        dayCategoryCounts[day][task.category as keyof typeof dayCategoryCounts[typeof day]]++;
      });

      // Calculate unaccounted time (assuming 8 working hours per day)
      historicalDates.forEach(day => {
        const dayTasks = taskHistory.filter(t => new Date(t.timestamp).toLocaleDateString() === day);
        const accountedSeconds = dayTasks.reduce((sum, t) => sum + (t.duration || 0), 0);
        const accountedHours = accountedSeconds / 3600;
        const unaccountedHours = Math.max(0, 8 - accountedHours); // 8 hour work day
        dayCategoryCounts[day].unaccountedHours = unaccountedHours;
        dayCategoryCounts[day].unaccountedCost = unaccountedHours * hourlyRate;
      });
      
      // Build array for chart
      return Object.keys(dayCategoryCounts)
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
        .map((day) => ({ 
          day, 
          rock: dayCategoryCounts[day].rock,
          pebble: dayCategoryCounts[day].pebble,
          sand: dayCategoryCounts[day].sand,
          unaccountedHours: dayCategoryCounts[day].unaccountedHours.toFixed(1),
          unaccountedCost: dayCategoryCounts[day].unaccountedCost.toFixed(2),
        }));
    } else {
      // Group by day for regular view
      const dayCounts: Record<string, number> = {};
      
      // Initialize all historical dates with 0 values
      historicalDates.forEach(day => {
        dayCounts[day] = 0;
      });
      
      // Add actual task data
      taskHistory.forEach((task) => {
        const day = new Date(task.timestamp).toLocaleDateString();
        dayCounts[day] = (dayCounts[day] || 0) + 1;
      });
      
      // Build array for chart
      return Object.keys(dayCounts)
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
        .map((day) => ({ day, count: dayCounts[day] }));
    }
  }, [showMinerals, taskHistory, hourlyRate]);

  // Optionally, render nothing until timer is loaded
  if (!hasLoaded) return null;

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
  };

  const displayedTasks = filteredAndSortedTasks.slice(0, tasksPerPage);
  const hasMore = filteredAndSortedTasks.length > tasksPerPage;

  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/sign-in');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleHome = () => {
    router.push('/');
  };

  const handleUpgrade = async () => {
    try {
      const checkoutUrl = await createCheckoutSession();
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to start upgrade. Please try again.');
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", padding: "2rem 1rem" }}>
      {/* Navigation Header */}
      <div style={{
        maxWidth: 1200,
        margin: "0 auto 2rem auto",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 1rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={handleHome}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#3498db",
              fontSize: 18,
              fontWeight: 700,
              padding: "8px 12px",
              borderRadius: 6,
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#f0f0f0"}
            onMouseLeave={(e) => e.currentTarget.style.background = "none"}
          >
            <span>BurnEngine</span>
          </button>
          {isPro && (
            <span style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              padding: "4px 10px",
              borderRadius: 12,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}>
              Pro
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {!isPro && (
            <button
              onClick={handleUpgrade}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "#3498db",
                border: "none",
                cursor: "pointer",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                padding: "8px 16px",
                borderRadius: 6,
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#2980b9"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#3498db"}
            >
              <span>Upgrade to Pro</span>
            </button>
          )}
          <button
            onClick={handleSignOut}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#f1f1f1",
              border: "none",
              cursor: "pointer",
              color: "#666",
              fontSize: 14,
              fontWeight: 500,
              padding: "8px 16px",
              borderRadius: 6,
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#e0e0e0"}
            onMouseLeave={(e) => e.currentTarget.style.background = "#f1f1f1"}
          >
            <FaSignOutAlt />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Flex row for main timer and cumulative chart */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "flex-start",
          gap: 24,
          maxWidth: 950,
          margin: "0 auto 2rem auto",
        }}
      >
        {/* Main timer and controls */}
        <div
          style={{
            flex: 1,
            maxWidth: 400,
            fontFamily: "Inter, sans-serif",
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 2px 12px #0001",
            padding: 24,
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <span style={{ fontWeight: 600, fontSize: 15 }}>Your hourly value</span>
            <input
              type="number"
              value={hourlyRate}
              min={1}
              onChange={(e) => setHourlyRate(Number(e.target.value))}
              style={{
                width: 70,
                border: "1px solid #ddd",
                borderRadius: 4,
                padding: "2px 6px",
                fontWeight: 600,
                marginLeft: 8,
              }}
            />
            <span style={{ marginLeft: 4, fontWeight: 500, color: "#888" }}>$ / hr</span>
            <span
              style={{
                marginLeft: "auto",
                color: Number(moneySpent) > 0 ? "#e74c3c" : "#333",
                fontWeight: 700,
                fontVariantNumeric: "tabular-nums",
                fontSize: 16,
              }}
            >
              -${moneySpent}
            </span>
          </div>
          {loginStreak > 0 && (
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 8, 
              marginBottom: 12,
              padding: "8px 12px",
              background: loginStreak >= 7 ? "#e8f5e8" : "#fff3cd",
              borderRadius: 6,
              border: `1px solid ${loginStreak >= 7 ? "#28a745" : "#ffc107"}`
            }}>
              <span style={{ fontSize: 16 }}>🔥</span>
              <span style={{ 
                fontWeight: 600, 
                fontSize: 14,
                color: loginStreak >= 7 ? "#28a745" : "#856404"
              }}>
                {loginStreak} day{loginStreak !== 1 ? 's' : ''} streak
              </span>
              {loginStreak >= 7 && (
                <span style={{ 
                  fontSize: 12, 
                  color: "#28a745",
                  fontWeight: 500
                }}>
                  • Keep it up!
                </span>
              )}
            </div>
          )}
          <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Work on the one thing</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <select
              value={currentTaskCategory}
              onChange={(e) => setCurrentTaskCategory(e.target.value)}
              style={{
                border: "1px solid #ddd",
                borderRadius: 4,
                padding: "6px 8px",
                fontWeight: 500,
                background: "#f5f5f5",
                fontSize: 14,
                minWidth: 80,
              }}
            >
              <option value="rock">Rock</option>
              <option value="pebble">Pebble</option>
              <option value="sand">Sand</option>
            </select>
            <input
              type="text"
              value={currentTask}
              onChange={(e) => setCurrentTask(e.target.value)}
              style={{
                flex: 1,
                border: "none",
                background: "#f5f5f5",
                borderRadius: 6,
                padding: "6px 10px",
                fontWeight: 500,
              }}
            />
            <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>{formatTime(timer)}</span>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 12, color: "#666", marginBottom: 4 }}>
              Value earned (optional)
            </label>
            <input
              type="number"
              value={valueEarned}
              onChange={(e) => setValueEarned(e.target.value)}
              placeholder="0.00"
              step="0.01"
              style={{
                width: "100%",
                padding: "6px 10px",
                border: "1px solid #ddd",
                borderRadius: 6,
                fontSize: 14,
                background: "#f5f5f5",
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <button
              onClick={handleFinishTask}
              style={{
                flex: 1,
                padding: "8px 0",
                borderRadius: 6,
                background: "#3498db",
                color: "#fff",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
              }}
            >
              Finish Task
            </button>
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#e74c3c",
              marginBottom: 8,
              textAlign: "center",
            }}
          >
            ${moneySpent}
          </div>
          <div style={{ fontSize: 14, color: "#666", display: "flex", justifyContent: "center", gap: "16px" }}>
            <span>${perMinuteSpent}/min</span>
            <span>${perSecondSpent}/sec</span>
          </div>
        </div>
        {/* Cumulative Line Chart */}
        <div style={{ flex: 1, maxWidth: 500, background: "#fff", borderRadius: 8, padding: 16, boxShadow: "0 1px 4px #0001" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h4 style={{ margin: 0, fontWeight: 700, fontSize: 16 }}>
              {showMinerals ? "Show Minerals" : "Cumulative Tasks Completed"}
            </h4>
            <button
              onClick={() => setShowMinerals(!showMinerals)}
              style={{
                background: showMinerals ? "#3498db" : "#f1f1f1",
                color: showMinerals ? "#fff" : "#333",
                border: "none",
                borderRadius: 4,
                padding: "4px 8px",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {showMinerals ? "Show All" : "Show Minerals"}
            </button>
          </div>
          <MemoizedChart chartData={chartData} showMinerals={showMinerals} />
        </div>
      </div>

      {/* Progress Dashboard */}
      {!taskHistoryMinimized && (
        <div style={{ maxWidth: 900, margin: "2rem auto", background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 2px 12px #0001" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ margin: 0, fontWeight: 700, fontSize: 20 }}>Progress Dashboard</h3>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setTimeframe("week")}
                style={{
                  background: timeframe === "week" ? "#3498db" : "#f1f1f1",
                  color: timeframe === "week" ? "#fff" : "#333",
                  border: "none",
                  borderRadius: 6,
                  padding: "6px 12px",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                This Week
              </button>
              <button
                onClick={() => setTimeframe("month")}
                style={{
                  background: timeframe === "month" ? "#3498db" : "#f1f1f1",
                  color: timeframe === "month" ? "#fff" : "#333",
                  border: "none",
                  borderRadius: 6,
                  padding: "6px 12px",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Last 30 Days
              </button>
            </div>
          </div>
          
          {/* Summary Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
            <div style={{ background: "#f8f9fa", borderRadius: 8, padding: 16 }}>
              <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>Total Tasks</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#222" }}>{dashboardData.totalTasks}</div>
            </div>
            <div style={{ background: "#f8f9fa", borderRadius: 8, padding: 16 }}>
              <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>Total Time</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#222" }}>
                {dashboardData.totalTime.hours}h {dashboardData.totalTime.minutes}m
              </div>
            </div>
            <div style={{ background: "#f8f9fa", borderRadius: 8, padding: 16 }}>
              <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>Total Cost</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#e74c3c" }}>${dashboardData.totalCost.toFixed(2)}</div>
            </div>
            <div style={{ background: "#f8f9fa", borderRadius: 8, padding: 16 }}>
              <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>Avg per Day</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#222" }}>{dashboardData.averagePerDay}</div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ marginBottom: 12, fontWeight: 600, fontSize: 16 }}>Category Breakdown</h4>
            <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
              <div style={{ flex: 1, background: "#fee", borderRadius: 8, padding: 12, border: "2px solid #e74c3c" }}>
                <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>Rocks</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#e74c3c" }}>{dashboardData.categoryBreakdown.rock}</div>
                <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>
                  {Math.floor(dashboardData.categoryTime.rock / 3600)}h {Math.floor((dashboardData.categoryTime.rock % 3600) / 60)}m
                </div>
              </div>
              <div style={{ flex: 1, background: "#fff4e6", borderRadius: 8, padding: 12, border: "2px solid #f39c12" }}>
                <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>Pebbles</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#f39c12" }}>{dashboardData.categoryBreakdown.pebble}</div>
                <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>
                  {Math.floor(dashboardData.categoryTime.pebble / 3600)}h {Math.floor((dashboardData.categoryTime.pebble % 3600) / 60)}m
                </div>
              </div>
              <div style={{ flex: 1, background: "#f5f5f5", borderRadius: 8, padding: 12, border: "2px solid #95a5a6" }}>
                <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>Sand</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#95a5a6" }}>{dashboardData.categoryBreakdown.sand}</div>
                <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>
                  {Math.floor(dashboardData.categoryTime.sand / 3600)}h {Math.floor((dashboardData.categoryTime.sand % 3600) / 60)}m
                </div>
              </div>
            </div>
          </div>

          {/* Trend and Best Day */}
          <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
            <div style={{ flex: 1, background: "#f8f9fa", borderRadius: 8, padding: 16 }}>
              <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>Trend</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: dashboardData.trend >= 0 ? "#28a745" : "#e74c3c" }}>
                {dashboardData.trend >= 0 ? "↑" : "↓"} {Math.abs(dashboardData.trend).toFixed(1)}%
              </div>
              <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>vs previous period</div>
            </div>
            {dashboardData.bestDay && (
              <div style={{ flex: 1, background: "#f8f9fa", borderRadius: 8, padding: 16 }}>
                <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>Best Day</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#222" }}>{dashboardData.bestDay.count} tasks</div>
                <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>{dashboardData.bestDay.date}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Task History */}
      <div
        style={{
          maxWidth: 900,
          background: "#fafbfc",
          borderRadius: 8,
          padding: 16,
          boxShadow: "0 1px 4px #0001",
          margin: "2rem auto 0 auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <h4 style={{ margin: 0, fontWeight: 700, fontSize: 16 }}>Task History</h4>
          <button
            onClick={() => setTaskHistoryMinimized((m) => !m)}
            style={{
              background: taskHistoryMinimized ? "#f1f1f1" : "#eee",
              border: "none",
              borderRadius: 8,
              boxShadow: "0 1px 4px #0001",
              fontSize: 18,
              cursor: "pointer",
              color: "#888",
              padding: 6,
              transition: "background 0.2s",
            }}
            title={taskHistoryMinimized ? "Expand" : "Minimize"}
          >
            {taskHistoryMinimized ? <FaPlus /> : <FaMinus />}
          </button>
        </div>
        {!taskHistoryMinimized && (
          <>
            {/* Search and Filters */}
            <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
                <FaSearch style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#999" }} />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px 8px 36px",
                    border: "1px solid #ddd",
                    borderRadius: 6,
                    fontSize: 14,
                  }}
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  fontSize: 14,
                  background: "#fff",
                }}
              >
                <option value="all">All Categories</option>
                <option value="rock">Rock</option>
                <option value="pebble">Pebble</option>
                <option value="sand">Sand</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  fontSize: 14,
                  background: "#fff",
                }}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest-cost">Highest Cost</option>
                <option value="longest-duration">Longest Duration</option>
              </select>
            </div>

            {/* Grouped Task List */}
            {Object.keys(groupedTasks).length === 0 ? (
              <div style={{ color: "#bbb", fontSize: 14, textAlign: "center", padding: 40 }}>
                {searchQuery || categoryFilter !== "all" ? "No tasks match your filters." : "No tasks finished yet."}
              </div>
            ) : (
              <>
                {(["Today", "Yesterday", "This Week", "Last Week", "Older"] as const).map((group) => {
                  const tasks = groupedTasks[group] || [];
                  if (tasks.length === 0) return null;
                  const isExpanded = expandedGroups.has(group);
                  const stats = getGroupStats(tasks);
                  
                  return (
                    <div key={group} style={{ marginBottom: 16 }}>
                      <button
                        onClick={() => toggleGroup(group)}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "12px 16px",
                          background: "#fff",
                          border: "1px solid #ddd",
                          borderRadius: 6,
                          cursor: "pointer",
                          marginBottom: 8,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          {isExpanded ? <FaChevronDown /> : <FaChevronUp />}
                          <span style={{ fontWeight: 700, fontSize: 16 }}>{formatDateHeader(group, tasks)}</span>
                        </div>
                        {isExpanded && (
                          <div style={{ fontSize: 12, color: "#666" }}>
                            {stats.count} tasks • {stats.hours}h {stats.minutes}m • ${stats.cost.toFixed(2)}
                          </div>
                        )}
                      </button>
                      {isExpanded && (
                        <div>
                          {tasks.slice(0, tasksPerPage).map((task, idx) => (
                            <div
                              key={task.id || idx}
                              style={{
                                marginBottom: 8,
                                padding: 12,
                                background: "#fff",
                                borderRadius: 6,
                                boxShadow: "0 1px 2px #0001",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-start",
                                position: "relative",
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                                <span style={{ fontWeight: 500, fontSize: 14 }}>{task.name || <em>Untitled</em>}</span>
                                {categoryEditTaskId === task.id ? (
                                  <select
                                    value={categoryEditValue}
                                    onChange={(e) => task.id && handleCategoryChange(task.id, e.target.value)}
                                    onBlur={() => setCategoryEditTaskId(null)}
                                    style={{
                                      borderRadius: 4,
                                      border: "1px solid #ccc",
                                      padding: "2px 4px",
                                      fontSize: 12,
                                      fontWeight: 600,
                                      textTransform: "uppercase",
                                      background: "#fff",
                                      color: "#333",
                                    }}
                                  >
                                    <option value="rock">Rock</option>
                                    <option value="pebble">Pebble</option>
                                    <option value="sand">Sand</option>
                                  </select>
                                ) : (
                                <span
                                  style={{
                                    padding: "2px 6px",
                                    borderRadius: 4,
                                    fontSize: 10,
                                    fontWeight: 600,
                                    textTransform: "uppercase",
                                    background: task.category === "rock" ? "#e74c3c" : task.category === "pebble" ? "#f39c12" : "#95a5a6",
                                    color: "#fff",
                                      cursor: task.id ? "pointer" : "default",
                                    }}
                                    title={task.id ? "Click to change category" : undefined}
                                    onClick={() => {
                                      if (task.id) {
                                        setCategoryEditTaskId(task.id);
                                        setCategoryEditValue(task.category);
                                      }
                                  }}
                                >
                                  {task.category}
                                </span>
                                )}
                              </div>
                              <span style={{ color: "#e74c3c", fontWeight: 700, fontVariantNumeric: "tabular-nums", marginLeft: 0, fontSize: 14 }}>
                                ${task.amount}
                              </span>
                              <span style={{ color: "#888", fontSize: 12, marginTop: 2 }}>
                                {formatTimestamp(Number(task.timestamp))}
                                {typeof task.duration === 'number' && (
                                  <span style={{ marginLeft: 8, color: '#3498db' }}>
                                    • {Math.floor(task.duration / 60)}m {(task.duration % 60).toString().padStart(2, '0')}s
                                  </span>
                                )}
                              </span>
                              <button
                                onClick={async () => {
                                  try {
                                    if (task.id) {
                                      await deleteTask(task.id);
                                      // Reload task history
                                      const updatedTasks = await fetchTasks();
                                      setTaskHistory(updatedTasks.map((t: any) => ({
                                        id: t.id,
                                        name: t.name,
                                        amount: t.cost,
                                        timestamp: Number(t.timestamp),
                                        duration: t.duration,
                                        category: t.category,
                                        valueEarned: t.valueEarned || 0,
                                      })));
                                    }
                                  } catch (error) {
                                    console.error('Error deleting task:', error);
                                  }
                                }}
                                style={{
                                  position: "absolute",
                                  top: 8,
                                  right: 8,
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  color: "#e74c3c",
                                  fontSize: 18,
                                }}
                                title="Delete Task"
                              >
                                <MdDelete />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
                {hasMore && (
                  <button
                    onClick={() => setTasksPerPage(prev => prev + 25)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      background: "#f1f1f1",
                      border: "1px solid #ddd",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: 14,
                      marginTop: 16,
                    }}
                  >
                    Load More ({filteredAndSortedTasks.length - tasksPerPage} remaining)
                  </button>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Open Loops and Outcomes Dashboard - Bottom row */}
      <div style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "flex-start",
        gap: 24,
        maxWidth: 900,
        margin: "2rem auto 0 auto",
        flexWrap: "wrap",
      }}>
      <OpenLoopsDashboard mainTaskActive={true} pauseMainTask={() => {}} />
        <OutcomesDashboard isPro={isPro} />
      </div>
    </div>
  );
}
