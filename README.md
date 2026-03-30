# TagTextarea

一个基于 Vue 3 的富文本标签输入组件，支持在文本中插入和编辑标签。

[English](README_EN.md) | 简体中文

## 在线体验

[立即体验](https://damahas.github.io/tagged-textarea/index.html)

## 功能特性

- 支持文本和标签混合编辑
- 标签可配置不同颜色
- 标签存储自定义数据
- 支持数据双向绑定
- 支持清空内容
- 支持实时数据获取
- 光标位置记忆，插入标签不影响已输入内容
- 支持多行文本输入
- 支持禁用状态
- 支持自定义高度

## 快速开始

### 安装

```bash
# 使用 npm
npm install tagged-textarea

# 使用 yarn
yarn add tagged-textarea

# 使用 pnpm
pnpm add tagged-textarea
```

### 基础用法

```vue
<template>
  <TagTextarea v-model="content" />
</template>

<script setup>
import { ref } from 'vue'
import TaggedTextarea from 'tagged-textarea'

const content = ref([
  { type: 'text', label: '你好，' },
  { type: 'username', label: '张三', value: 'user_123' }
])
</script>
```

## Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue | 内容数据 | `Array<{type: string, label: string, value?: any}>` | `[]` |
| placeholder | 占位提示 | `String` | `''` |
| disabled | 是否禁用 | `Boolean` | `false` |
| minHeight | 最小高度 | `String` | `'80px'` |
| tagColors | 标签颜色配置 | `Object` | 见下方默认配置 |

### tagColors 默认配置

```js
{
  default: '#409eff',
  user: '#67c23a',
  system: '#e6a23c',
  warning: '#f56c6c',
  info: '#909399'
}
```

## 数据结构

```typescript
interface ContentItem {
  type: 'text' | string  // text 表示纯文本，其他值表示标签类型
  label: string           // 显示文本
  value?: any            // 自定义数据（仅标签需要）
}
```

## API

### Methods

通过 ref 可以访问以下方法：

| 方法名 | 说明 | 参数 |
|--------|------|------|
| `addTag(tagData)` | 在光标位置插入标签 | `tagData: { type, label, value }` |
| `clearContent()` | 清空编辑器内容 | - |
| `getContent()` | 获取当前内容数组 | - |
| `deleteTag(index)` | 删除指定索引的标签 | `index: number` |
| `editTag(index, tagData)` | 编辑指定索引的标签 | `index: number, tagData: object` |
| `focus()` | 聚焦编辑器 | - |
| `blur()` | 失焦编辑器 | - |

### Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| `update:modelValue` | 值更新时触发 | 新内容数组 |
| `change` | 内容变化时触发 | 新内容数组 |
| `blur` | 失去焦点时触发 | - |
| `focus` | 获得焦点时触发 | - |
| `tag-add` | 添加标签时触发 | 标签数据 |
| `tag-edit` | 编辑标签时触发 | 标签索引，标签数据 |
| `tag-delete` | 删除标签时触发 | 标签索引，标签数据 |

## 使用示例

### 基础示例

```vue
<template>
  <TagTextarea ref="textareaRef" v-model="content" placeholder="请输入内容" />
  <button @click="addTag">添加标签</button>
  <button @click="clearContent">清空内容</button>
</template>

<script setup>
import { ref } from 'vue'

const content = ref([])
const textareaRef = ref(null)

const addTag = () => {
  textareaRef.value?.addTag({
    type: 'tag',
    label: '新标签',
    value: 'tag_001'
  })
}

const clearContent = () => {
  textareaRef.value?.clearContent()
}
</script>
```

### 自定义标签颜色

```vue
<template>
  <TagTextarea
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
  { type: 'text', label: '用户 ' },
  { type: 'username', label: '张三', value: 'user_001' },
  { type: 'text', label: ' 在 ' },
  { type: 'date', label: '2024-03-30', value: '2024-03-30' },
  { type: 'text', label: ' 创建了高优先级任务' }
])
</script>
```

### 快捷标签插入

```vue
<template>
  <div>
    <TagTextarea ref="textareaRef" v-model="content" placeholder="点击下方按钮插入标签" />
    <div class="toolbar">
      <button @click="insertTag('username', '用户名', 'username')">用户</button>
      <button @click="insertTag('date', '日期', 'date')">日期</button>
      <button @click="insertTag('priority', '高优先级', 'high')">优先级</button>
      <button @click="insertTag('status', '进行中', 'processing')">状态</button>
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

### 带默认数据和自定义高度

```vue
<template>
  <TagTextarea
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
  { type: 'text', label: '工单 ' },
  { type: 'ticket', label: '#1234', value: 'ticket_1234' },
  { type: 'text', label: ' 由 ' },
  { type: 'user', label: '李四', value: { id: 1, name: '李四' } },
  { type: 'text', label: ' 处理，所属部门：' },
  { type: 'department', label: '技术部', value: 'tech' }
])
</script>
```

### 禁用状态

```vue
<template>
  <TagTextarea
    v-model="content"
    :disabled="true"
    placeholder="禁用状态，不可编辑"
  />
</template>

<script setup>
import { ref } from 'vue'

const content = ref([
  { type: 'text', label: '这是一段不可编辑的文本，' },
  { type: 'tag', label: '标签不可删除', value: 'readonly' }
])
</script>
```

## 数据结构

```typescript
interface ContentItem {
  type: 'text' | string  // 'text' 表示纯文本，其他值表示标签类型
  label: string           // 显示文本
  value?: any            // 自定义数据（仅标签需要）
}
```

**数据说明：**
- `type`: 标签类型，用于匹配颜色配置（如 `'username'`、`'date'`、`'priority'` 等）
- `label`: 标签或文本显示的内容
- `value`: 标签的自定义数据，可存储任意值（ID、对象、复杂结构等）

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建组件库
npm run build:lib

# 预览构建结果
npm run preview
```

## 浏览器兼容性

支持所有现代浏览器（Chrome、Firefox、Safari、Edge）。

## License

MIT

## 更新日志

### v1.0.0
- 初始版本发布
- 支持文本和标签混合编辑
- 支持标签颜色自定义
- 支持光标位置记忆
- 支持多行文本输入
