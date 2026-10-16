import 'fake-indexeddb/auto'
import { Blob as NodeBlob, File as NodeFile } from 'node:buffer'

if (typeof globalThis.Blob !== 'undefined') {
  globalThis.Blob = NodeBlob as unknown as typeof Blob
  if (typeof NodeFile !== 'undefined') {
    globalThis.File = NodeFile as unknown as typeof File
  }
}
