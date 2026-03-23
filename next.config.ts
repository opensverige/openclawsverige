import type { NextConfig } from 'next'
import createMDX from '@next/mdx'

// Strip YAML frontmatter (--- ... ---) from MDX. Without this, --- becomes
// thematic breaks and each YAML line can become its own paragraph (leaked text).
// Also handles the setext-heading edge case: if the last YAML line has no blank
// line before the closing ---, remark parses --- as a setext h2 underline,
// consuming it so the thematicBreak is never emitted. We treat the first h2
// encountered before finding a thematicBreak as the closing delimiter.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function remarkStripFrontmatter() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (tree: any) => {
    if (!Array.isArray(tree.children) || tree.children.length < 2) return
    // remark-frontmatter (if present) emits a 'yaml' node — just drop it
    if (tree.children[0]?.type === 'yaml') {
      tree.children.splice(0, 1)
      return
    }
    if (tree.children[0]?.type !== 'thematicBreak') return
    let end = -1
    for (let i = 1; i < tree.children.length; i++) {
      const child = tree.children[i]
      if (child?.type === 'thematicBreak') {
        end = i
        break
      }
      // Setext heading: last YAML line + "---" underline produces an h2 node
      // that consumed the closing delimiter. Accept it only if we haven't yet
      // seen any "real" content node (e.g. a ## heading from the article body).
      if (child?.type === 'heading' && child?.depth === 2) {
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
