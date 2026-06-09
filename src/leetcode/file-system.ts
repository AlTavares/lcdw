export async function writeFile(path: string, content: string, overwrite: boolean) {
  const file = Bun.file(path)

  if (!overwrite && (await file.exists())) {
    throw new Error(`${path} already exists. Pass --overwrite to replace it.`)
  }

  await Bun.write(path, content)
}
