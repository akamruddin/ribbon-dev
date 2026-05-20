import client from './client'

export async function getThreads({ category = 'all', query = '' } = {}) {
  const { data } = await client.get('/api/forum/threads', { params: { category, q: query } })
  return data
}

export async function getThread(id) {
  const { data } = await client.get(`/api/forum/threads/${id}`)
  return data
}

export async function postThread({ category, title, body, tags = [] }) {
  const { data } = await client.post('/api/forum/threads', { category, title, body, tags })
  return data
}

export async function postReply(threadId, { body }) {
  const { data } = await client.post(`/api/forum/threads/${threadId}/replies`, { body })
  return data
}

export async function deleteThread(id) {
  const { data } = await client.delete(`/api/forum/threads/${id}`)
  return data
}

export async function deleteReply(id) {
  const { data } = await client.delete(`/api/forum/replies/${id}`)
  return data
}

export async function banUser(userId) {
  const { data } = await client.post(`/api/forum/users/${userId}/ban`)
  return data
}

export async function unbanUser(userId) {
  const { data } = await client.post(`/api/forum/users/${userId}/unban`)
  return data
}
