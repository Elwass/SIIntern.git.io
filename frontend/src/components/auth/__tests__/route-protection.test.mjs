import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const appSource = readFileSync(new URL('../../../App.jsx', import.meta.url), 'utf8')

test('protected dashboard routes are nested behind ProtectedRoute redirect guard', () => {
  const protectedBlock = appSource.slice(appSource.indexOf('<Route element={<ProtectedRoute />}>'))

  for (const routePath of ['/admin', '/mentor', '/student', '/student/applications', '/student/documents', '/student/logbooks', '/report']) {
    assert.match(protectedBlock, new RegExp(`path="${routePath}"`))
  }
})

test('logged-in users are redirected away from login and register routes', () => {
  const publicOnlyBlock = appSource.slice(appSource.indexOf('<Route element={<PublicOnlyRoute />}>'), appSource.indexOf('<Route path="/reset-password"'))

  assert.match(publicOnlyBlock, /path="\/login"/)
  assert.match(publicOnlyBlock, /path="\/register"/)
})
