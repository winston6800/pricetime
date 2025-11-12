// API helper functions for client-side data fetching

export async function fetchUserData() {
  const res = await fetch('/api/data');
  if (!res.ok) throw new Error('Failed to fetch user data');
  return res.json();
}

export async function saveUserData(data: any) {
  const res = await fetch('/api/data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to save user data');
  return res.json();
}

export async function fetchTasks() {
  const res = await fetch('/api/tasks');
  if (!res.ok) throw new Error('Failed to fetch tasks');
  return res.json();
}

export async function createTask(task: { name: string; category: string; cost: string; duration: number }) {
  const res = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  });
  if (!res.ok) throw new Error('Failed to create task');
  return res.json();
}

export async function deleteTask(taskId: string) {
  const res = await fetch(`/api/tasks?id=${taskId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete task');
  return res.json();
}

export async function fetchLoops() {
  const res = await fetch('/api/loops');
  if (!res.ok) throw new Error('Failed to fetch loops');
  return res.json();
}

export async function saveLoop(loop: { id?: string; name: string; timer: number; rate: number; isActive: boolean; timerStartTime?: number | null }) {
  const res = await fetch('/api/loops', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(loop),
  });
  if (!res.ok) throw new Error('Failed to save loop');
  return res.json();
}

export async function deleteLoop(loopId: string) {
  const res = await fetch(`/api/loops?id=${loopId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete loop');
  return res.json();
}

