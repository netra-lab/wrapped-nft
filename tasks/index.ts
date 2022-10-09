import { existsSync } from 'fs'
import { join } from 'path'

const compiled = existsSync(join(__dirname, '../types'))
if (compiled) {
  require('./batch-wrap')
  require('./batch-unwrap')
  require('./whitelist-collection')
}
