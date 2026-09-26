import { expect, test } from '@playwright/test'

test('main navigation remains usable', async ({ page }) => {
  await page.goto('/?preview=Al-Kareem')
  await expect(page.getByText('Votre apprentissage commence ici')).toBeVisible()
  await page.getByRole('button', { name: 'Apprendre' }).click()
  await expect(page.getByRole('heading', { name: 'Apprendre' })).toBeVisible()
  await page.getByRole('button', { name: 'Prophètes' }).click()
  await expect(page.getByRole('dialog', { name: 'Coming Soon' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Apprendre' })).toBeVisible()
})

test('layout has no horizontal overflow on a phone', async ({ page }) => {
  await page.goto('/?preview=Al-Kareem')
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  expect(overflow).toBe(false)
})

test('desktop uses the available viewport instead of a phone frame', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/?preview=Al-Kareem')
  const width = await page.locator('main > div').first().evaluate(element => element.getBoundingClientRect().width)
  expect(width).toBeGreaterThan(900)
})
