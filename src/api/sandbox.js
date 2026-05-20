import client from './client'
import { DEVICES } from '../data/devices'

export async function getAvailability(date, tz) {
  const { data } = await client.get('/api/sandbox/availability', { params: { date, tz } })
  return data  // { slots, date }
}

export async function getMyReservations() {
  const { data } = await client.get('/api/sandbox/reservations/my')
  return data  // { reservations }
}

export async function createReservation(startTime, onDemand = false) {
  const body = onDemand ? { on_demand: true } : { start_time: startTime }
  const { data } = await client.post('/api/sandbox/reservations', body)
  return data
}

export async function getReservation(id) {
  const { data } = await client.get(`/api/sandbox/reservations/${id}`)
  return { ...data, devices: DEVICES }
}

export async function extendReservation(id) {
  const { data } = await client.post(`/api/sandbox/reservations/${id}/extend`)
  return data
}

export async function cancelReservation(id) {
  const { data } = await client.delete(`/api/sandbox/reservations/${id}`)
  return data
}

export async function endReservation(id) {
  const { data } = await client.post(`/api/sandbox/reservations/${id}/end`)
  return data
}

export async function getSandboxStats() {
  const { data } = await client.get('/api/sandbox/stats')
  return data
}

export async function getEnvironments() {
  const { data } = await client.get('/api/sandbox/environments')
  return data  // { environments, maxEnvironments }
}
