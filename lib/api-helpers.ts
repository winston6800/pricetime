// API helper functions for client-side data fetching

export async function fetchUserData() {
  const res = await fetch('/api/data');
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to fetch user data' }));
    throw new Error(error.error || 'Failed to fetch user data');
  }
  return res.json();
}

export async function saveUserData(data: any) {
  try {
    const res = await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      // Check if response is JSON or HTML (error page)
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const error = await res.json().catch(() => ({ error: 'Failed to save user data' }));
        throw new Error(error.error || 'Failed to save user data');
      } else {
        // HTML error page - likely authentication or server error
        throw new Error(`Failed to save user data: ${res.status} ${res.statusText}. Please refresh the page.`);
      }
    }
    return res.json();
  } catch (error) {
    // Network errors or other fetch failures
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to server. Please check your connection.');
    }
    throw error;
  }
}

export async function fetchTasks() {
  const res = await fetch('/api/tasks');
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to fetch tasks' }));
    throw new Error(error.error || 'Failed to fetch tasks');
  }
  return res.json();
}

export async function createTask(task: { name: string; category: string; cost: string; duration: number }) {
  const res = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to create task' }));
    throw new Error(error.error || 'Failed to create task');
  }
  return res.json();
}

export async function deleteTask(taskId: string) {
  const res = await fetch(`/api/tasks?id=${taskId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    // Check if response is JSON or HTML (error page)
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const error = await res.json().catch(() => ({ error: 'Failed to delete task' }));
      throw new Error(error.error || 'Failed to delete task');
    } else {
      // HTML error page - likely authentication or server error
      throw new Error(`Failed to delete task: ${res.status} ${res.statusText}`);
    }
  }
  return res.json();
}

export async function fetchLoops() {
  const res = await fetch('/api/loops');
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to fetch loops' }));
    throw new Error(error.error || 'Failed to fetch loops');
  }
  return res.json();
}

export async function saveLoop(loop: { id?: string; name: string; timer: number; rate: number; isActive: boolean; timerStartTime?: number | null }) {
  const res = await fetch('/api/loops', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(loop),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to save loop' }));
    throw new Error(error.error || 'Failed to save loop');
  }
  return res.json();
}

export async function deleteLoop(loopId: string) {
  const res = await fetch(`/api/loops?id=${loopId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to delete loop' }));
    throw new Error(error.error || 'Failed to delete loop');
  }
  return res.json();
}

