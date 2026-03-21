import type { NextConfig } from 'next'
import createMDX from '@next/mdx'

// Strip YAML frontmatter (--- ... ---) from MDX. Without this, --- becomes
// thematic breaks and each YAML line can become its own paragraph (leaked text).
// Removes from the first --- through the closing ---, inclusive.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function remarkStripFrontmatter() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (tree: any) => {
    if (!Array.isArray(tree.children) || tree.children.length < 2) return
    if (tree.children[0]?.type !== 'thematicBreak') return
    let end = -1
    for (let i = 1; i < tree.children.length; i++) {
      if (tree.children[i]?.type === 'thematicBreak') {
        end = i
        break
      }
    }
    if (end === -1) return
    tree.children.splice(0, end + 1)
  }
}

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkStripFrontmatter],
  },
})

const config: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
}

export default withMDX(config)
