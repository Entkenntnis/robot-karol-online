const fs = require('fs')
const path = require('path')

// Path to chapters directory
const chaptersDir = path.join(__dirname, '..', 'lib', 'data', 'chapters')
const outputPath = path.join(__dirname, '..', 'lib', 'data', 'chapters.ts')
const idsPath = path.join(__dirname, 'ids.json')

// Read all folders from chapters directory
function getChaptersDirectories() {
  try {
    // Read all items in the chapters directory
    const items = fs.readdirSync(chaptersDir)

    // Filter to only include directories
    const directories = items.filter((item) => {
      const itemPath = path.join(chaptersDir, item)
      return fs.statSync(itemPath).isDirectory()
    })

    // Sort directories alphabetically
    const sortedDirectories = directories.sort()

    console.log('Found chapters:', sortedDirectories)
    return sortedDirectories
  } catch (error) {
    console.error('Error reading chapters directory:', error.message)
    return []
  }
}

// Read meta.json file for a chapter
function readChapterMeta(chapterDir) {
  const metaPath = path.join(chaptersDir, chapterDir, 'meta.json')

  try {
    if (fs.existsSync(metaPath)) {
      const metaContent = fs.readFileSync(metaPath, 'utf8')
      const metaData = JSON.parse(metaContent)
      return metaData
    } else {
      console.warn(`No meta.json found for chapter ${chapterDir}`)
      return null
    }
  } catch (error) {
    console.error(
      `Error reading meta.json for chapter ${chapterDir}:`,
      error.message
    )
    return null
  }
}

// Read info.md file for a chapter
function readChapterInfo(chapterDir) {
  const infoPath = path.join(chaptersDir, chapterDir, 'info.md')

  try {
    if (fs.existsSync(infoPath)) {
      const infoContent = fs.readFileSync(infoPath, 'utf8')
      // console.log(`Found info.md for chapter ${chapterDir}`)
      return infoContent
    } else {
      // No need to warn, info.md is optional
      return null
    }
  } catch (error) {
    console.error(
      `Error reading info.md for chapter ${chapterDir}:`,
      error.message
    )
    return null
  }
}

// Read quest JSON file
function readQuestFile(chapterDir, questFilename) {
  const questPath = path.join(chaptersDir, chapterDir, questFilename)

  try {
    if (fs.existsSync(questPath)) {
      const questContent = fs.readFileSync(questPath, 'utf8')
      const questData = JSON.parse(questContent)
      return questData
    } else {
      console.warn(`Quest file not found: ${questPath}`)
      return null
    }
  } catch (error) {
    console.error(`Error reading quest file ${questPath}:`, error.message)
    return null
  }
}

// Read and update IDs from ids.json
function readAndUpdateIds() {
  try {
    const idsContent = fs.readFileSync(idsPath, 'utf8')
    return JSON.parse(idsContent)
  } catch (error) {
    console.error(`Error reading ids.json:`, error.message)
    return { keys: {}, counter: 100 }
  }
}

// Get quest ID from ids.json or create a new one
function getQuestId(chapterDir, questFilename, idsData) {
  const questPath = `${chapterDir}/${questFilename}`

  // If the quest already has an ID, use it
  if (idsData.keys[questPath]) {
    return idsData.keys[questPath]
  }

  // Otherwise, create a new ID
  const newId = idsData.counter
  idsData.keys[questPath] = newId
  idsData.counter++

  console.log(`Assigned new ID ${newId} to ${questPath}`)
  return newId
}

// Track which quest paths are found in the current run
const foundQuestPaths = new Set()

// Write updated IDs back to ids.json
function writeIdsFile(idsData) {
  try {
    // Clean up ids by removing entries that weren't found in the current run
    const cleanedKeys = {}

    // Only keep keys that were found in the current run
    for (const questPath of foundQuestPaths) {
      if (idsData.keys[questPath]) {
        cleanedKeys[questPath] = idsData.keys[questPath]
      }
    }

    // Update the idsData with cleaned keys
    const cleanedIdsData = {
      keys: cleanedKeys,
      counter: idsData.counter,
    }

    fs.writeFileSync(idsPath, JSON.stringify(cleanedIdsData, null, 2))
    console.log(
      `Updated ids.json with new IDs and removed ${
        Object.keys(idsData.keys).length - Object.keys(cleanedKeys).length
      } unused entries`
    )
  } catch (error) {
    console.error(`Error writing to ids.json:`, error.message)
  }
}

// Get sorted chapter directories
const chapters = getChaptersDirectories()

// Read ids.json for existing IDs
const idsData = readAndUpdateIds()

// Read meta.json for each chapter and prepare data
const chaptersData = chapters.map((chapterDir, index) => {
  const meta = readChapterMeta(chapterDir)
  const info = readChapterInfo(chapterDir)
  const id = 10001 + index // Start IDs from 10001

  return {
    id,
    dirName: chapterDir,
    title: `${index}. ${meta?.title || chapterDir}`,
    originalTitle: meta?.title || chapterDir,
    description: info || '', // Add the info.md content as description
    quests: meta?.quests || [],
  }
})

// Generate the chapters.ts file
function generateChaptersFile() {
  // Create content for chaptersData with direct references to questsData
  const chaptersWithQuests = chaptersData.map((chapter) => {
    // Add id and content properties to each quest
    const quests = chapter.quests.map((quest) => {
      const questData = readQuestFile(chapter.dirName, quest.filename)

      // Add this quest path to the found paths set
      const questPath = `${chapter.dirName}/${quest.filename}`
      foundQuestPaths.add(questPath)

      const uniqueId = getQuestId(chapter.dirName, quest.filename, idsData)
      return {
        ...quest,
        id: uniqueId,
        content: questData,
      }
    })

    return {
      ...chapter,
      quests,
    }
  })

  // Write updated IDs back to ids.json
  writeIdsFile(idsData)

  // Create the content of the file
  const fileContent = `// Auto-generated by pack.js - DO NOT EDIT MANUALLY
import { Heading, QuestData } from '../state/types'
import { deserializeQuestToData } from '../commands/json'

// Define chapter information from meta.json files
const chapterInfo = ${JSON.stringify(chaptersWithQuests, null, 2)}

// Generate chaptersMap based on chapter information
export const chaptersMap: {
  [key: number]: { x: number; y: number; deps: number[]; dir?: Heading }
} = {}

export const chapterOverviewData: {
  title: string
  titleEn: string
  quests: number[]
}[] = []

// Generate chapterQuests based on chapter information
export const chapterQuests: { [key: number]: QuestData } = {}

// Generate chapterData based on chapter information
export const chapterData: { [key: number]: { title: string, description: string } } = {}

// Populate the exported objects
chapterInfo.forEach((chapter) => {
  // Add chapter to chapterData
  chapterData[chapter.id] = {
    title: chapter.title,
    description: chapter.description,
  }

  // Default chapter position and dependencies
  chaptersMap[chapter.id] = {
    x: 600,
    y: 1750,
    deps: [61],
  }
  
  const title = \`\${chapter.title} (Python-Kurs)\`

  const c = {
    title,
    titleEn: title,
    quests: [] as number[],
  }

  // Add quests from this chapter to chapterQuests
  chapter.quests.forEach((quest) => {
    const questId = quest.id
    chapterQuests[questId] = deserializeQuestToData(quest.content as any)
    chaptersMap[questId] = {
      x: quest.x,
      y: quest.y + 1800,
      deps: [chapter.id],
    }
    c.quests.push(questId)
  })
  chapterOverviewData.push(c)
})
`

  // Write the file
  fs.writeFileSync(outputPath, fileContent)
  console.log(`Generated chapters.ts file at ${outputPath}`)
}

// Generate the chapters.ts file
generateChaptersFile()
