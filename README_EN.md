# TaggedTextarea

A Vue 3 rich text input component with tag support. Allows inserting and editing tags within text content.

English | [简体中文](README.md)

## Live Demo

[View Demo](https://damahas.github.io/tagged-textarea/index.html)

## Features

- Mixed editing of text and tags
- Configurable tag colors
- Store custom data in tags
- Two-way data binding
- Content clearing
- Real-time data retrieval
- Cursor position memory - inserting tags doesn't affect already entered content
- Multi-line text input support
- Disabled state support
- Customizable height

## Quick Start

### Installation

```bash
# Using npm
npm install tagged-textarea

# Using yarn
yarn add tagged-textarea

# Using pnpm
pnpm add tagged-textarea
```

### Basic Usage

```vue
<template>
  <TaggedTextarea v-model="content" />
</template>

<script setup>
import { ref } from 'vue'
import TaggedTextarea from 'tagged-textarea'

const content = ref([
  { type: 'text', label: 'Hello, ' },
  { type: 'username', label: 'John', value: 'user_123' }
])
</script>
```

## Props

| Property | Description | Type | Default |
|----------|-------------|------|---------|
| modelValue | Content data | `Array<{type: string, label: string, value?: any}>` | `[]` |
| placeholder | Placeholder text | `String` | `''` |
| disabled | Whether disabled | `Boolean` | `false` |
| minHeight | Minimum height | `String` | `'80px'` |
| tagColors | Tag color configuration | `Object` | See default config below |

### Default tagColors Configuration

```js
{
  default: '#409eff',
  user: '#67c23a',
  system: '#e6a23c',
  warning: '#f56c6c',
  info: '#909399'
}
```

## Data Structure

```typescript
interface ContentItem {
  type: 'text' | string  // 'text' for plain text, other values for tag type
  label: string           // Display text
  value?: any            // Custom data (only for tags)
}
```

## API

### Methods

Access the following methods via ref:

| Method | Description | Parameters |
|--------|-------------|------------|
| `addTag(tagData)` | Insert tag at cursor position | `tagData: { type, label, value }` |
| `clearContent()` | Clear editor content | - |
| `getContent()` | Get current content array | - |
| `deleteTag(index)` | Delete tag at specified index | `index: number` |
| `editTag(index, tagData)` | Edit tag at specified index | `index: number, tagData: object` |
| `focus()` | Focus editor | - |
| `blur()` | Blur editor | - |

### Events

| Event Name | Description | Parameters |
|------------|-------------|------------|
| `update:modelValue` | Triggered when value updates | New content array |
| `change` | Triggered when content changes | New content array |
| `blur` | Triggered when editor loses focus | - |
| `focus` | Triggered when editor gains focus | - |
| `tag-add` | Triggered when tag is added | Tag data |
| `tag-edit` | Triggered when tag is edited | Tag index, tag data |
| `tag-delete` | Triggered when tag is deleted | Tag index, tag data |

## Examples

### Basic Example

```vue
<template>
  <TaggedTextarea ref="textareaRef" v-model="content" placeholder="Enter content" />
  <button @click="addTag">Add Tag</button>
  <button @click="clearContent">Clear Content</button>
</template>

<script setup>
import { ref } from 'vue'

const content = ref([])
const textareaRef = ref(null)

const addTag = () => {
  textareaRef.value?.addTag({
    type: 'tag',
    label: 'New Tag',
    value: 'tag_001'
  })
}

const clearContent = () => {
  textareaRef.value?.clearContent()
}
</script>
```

### Custom Tag Colors

```vue
<template>
  <TaggedTextarea
    v-model="content"
    :tag-colors="{
      default: '#409eff',
      username: '#67c23a',
      date: '#e6a23c',
      priority: '#f56c6c',
      status: '#909399'
    }"
  />
</template>

<script setup>
import { ref } from 'vue'

const content = ref([
  { type: 'text', label: 'User ' },
  { type: 'username', label: 'John', value: 'user_001' },
  { type: 'text', label: ' created a high priority task on ' },
  { type: 'date', label: '2024-03-30', value: '2024-03-30' }
])
</script>
```

### Quick Tag Insertion

```vue
<template>
  <div>
    <TaggedTextarea ref="textareaRef" v-model="content" placeholder="Click buttons below to insert tags" />
    <div class="toolbar">
      <button @click="insertTag('username', 'Username', 'username')">User</button>
      <button @click="insertTag('date', 'Date', 'date')">Date</button>
      <button @click="insertTag('priority', 'High Priority', 'high')">Priority</button>
      <button @click="insertTag('status', 'In Progress', 'processing')">Status</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const content = ref([])
const textareaRef = ref(null)

const insertTag = (type, label, value) => {
  textareaRef.value?.addTag({ type, label, value })
}
</script>
```

### Default Data and Custom Height

```vue
<template>
  <TaggedTextarea
    v-model="content"
    :min-height="'120px'"
    :tag-colors="tagColors"
  />
</template>

<script setup>
import { ref } from 'vue'

const tagColors = {
  default: '#409eff',
  user: '#67c23a',
  ticket: '#e6a23c',
  department: '#f56c6c'
}

const content = ref([
  { type: 'text', label: 'Ticket ' },
  { type: 'ticket', label: '#1234', value: 'ticket_1234' },
  { type: 'text', label: ' handled by ' },
  { type: 'user', label: 'John', value: { id: 1, name: 'John' } },
  { type: 'text', label: ', Department: ' },
  { type: 'department', label: 'Tech', value: 'tech' }
])
</script>
```

### Disabled State

```vue
<template>
  <TaggedTextarea
    v-model="content"
    :disabled="true"
    placeholder="Disabled, cannot edit"
  />
</template>

<script setup>
import { ref } from 'vue'

const content = ref([
  { type: 'text', label: 'This is non-editable text, ' },
  { type: 'tag', label: 'Tag cannot be deleted', value: 'readonly' }
])
</script>
```

## Data Structure Details

```typescript
interface ContentItem {
  type: 'text' | string  // 'text' for plain text, other values for tag type
  label: string           // Display text
  value?: any            // Custom data (only for tags)
}
```

**Data Description:**
- `type`: Tag type, used to match color configuration (e.g., `'username'`, `'date'`, `'priority'`, etc.)
- `label`: Display text of the tag or text content
- `value`: Custom data for the tag, can store any value (ID, object, complex structure, etc.)

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build component library
npm run build:lib

# Preview build result
npm run preview
```

## Browser Compatibility

Supports all modern browsers (Chrome, Firefox, Safari, Edge).

## License

MIT

## Changelog

### v1.0.0
- Initial release
- Support for mixed text and tag editing
- Support for custom tag colors
- Support for cursor position memory
- Support for multi-line text input
