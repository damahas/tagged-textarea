<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  minHeight: {
    type: String,
    default: '80px'
  },
  tagColors: {
    type: Object,
    default: () => ({
      default: '#409eff',
      user: '#67c23a',
      system: '#e6a23c',
      warning: '#f56c6c',
      info: '#909399'
    })
  }
})

const emit = defineEmits(['update:modelValue', 'change', 'blur', 'focus', 'tag-add', 'tag-edit', 'tag-delete'])

const editorRef = ref(null)
const contentData = ref([])
const savedRange = ref(null) // 保存的光标位置
const isMounted = ref(false) // 组件是否已挂载

watch(() => props.modelValue, (newVal) => {
  if (JSON.stringify(newVal) !== JSON.stringify(contentData.value)) {
    contentData.value = newVal || []
    if (isMounted.value) {
      renderContent()
    }
  }
}, { deep: true, immediate: true })

// 组件挂载后初始化渲染
nextTick(() => {
  isMounted.value = true
  if (contentData.value.length > 0) {
    renderContent()
  }
})

// 渲染内容到编辑器
const renderContent = () => {
  if (!editorRef.value) return

  editorRef.value.innerHTML = ''

  contentData.value.forEach((item, index) => {
    if (item.type === 'text') {
      // 处理文本中可能包含的多个换行符
      const text = item.label || ''
      let currentPos = 0
      while (currentPos < text.length) {
        const nextLineBreak = text.indexOf('\n', currentPos)
        if (nextLineBreak === -1) {
          // 没有更多换行符，添加剩余文本
          if (currentPos < text.length) {
            const textNode = document.createTextNode(text.substring(currentPos))
            editorRef.value.appendChild(textNode)
          }
          break
        } else {
          // 添加换行符前的文本
          if (nextLineBreak > currentPos) {
            const textNode = document.createTextNode(text.substring(currentPos, nextLineBreak))
            editorRef.value.appendChild(textNode)
          }
          // 添加换行符
          const br = document.createElement('br')
          editorRef.value.appendChild(br)
          currentPos = nextLineBreak + 1
        }
      }
    } else {
      createTagElement(item, index)
    }
  })

  // 添加零宽空格作为占位符
  if (editorRef.value.childNodes.length === 0) {
    const spacer = document.createTextNode('\u200B')
    editorRef.value.appendChild(spacer)
  }
}

// 创建标签元素
const createTagElement = (item, index) => {
  const tagElement = document.createElement('span')
  tagElement.className = 'editor-tag'
  tagElement.contentEditable = 'false'
  tagElement.dataset.index = index

  // 根据 tag 的 value 获取颜色，如果没有匹配则使用默认颜色
  const tagColor = props.tagColors[item.type] || props.tagColors.default || '#409eff'
  tagElement.style.backgroundColor = tagColor

  const tagContent = document.createElement('span')
  tagContent.className = 'tag-content'
  tagContent.textContent = item.label
  tagElement.appendChild(tagContent)

  if (!props.disabled) {
    const deleteBtn = document.createElement('span')
    deleteBtn.className = 'tag-delete'
    deleteBtn.textContent = '×'
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation()
      e.preventDefault()
      deleteTag(index)
    })
    tagElement.appendChild(deleteBtn)

    tagElement.addEventListener('dblclick', (e) => {
      e.preventDefault()
      editTag(index)
    })
  }

  editorRef.value.appendChild(tagElement)
}

// 添加标签（外部可调用）
const addTag = (tagData) => {
  const editor = editorRef.value
  if (!editor) return

  const newTag = {
    type: tagData.type || 'tag',
    label: tagData.label || '',
    value: tagData.value || ''
  }

  let range = null

  // 尝试使用保存的光标位置
  if (savedRange.value) {
    range = savedRange.value
  } else {
    // 尝试使用当前光标位置
    const selection = window.getSelection()
    if (selection.rangeCount > 0) {
      const currentRange = selection.getRangeAt(0)
      if (editor.contains(currentRange.commonAncestorContainer)) {
        range = currentRange
      }
    }
  }

  if (!range) {
    // 没有光标位置，追加到末尾
    contentData.value.push(newTag)
    renderContent()
  } else {
    // 恢复光标位置
    const selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)

    // 在 DOM 层面分割文本节点
    const startContainer = range.startContainer
    const startOffset = range.startOffset

    let beforeText = ''
    let afterText = ''

    if (startContainer.nodeType === Node.TEXT_NODE && startContainer.parentNode) {
      // 光标在文本节点中，需要分割文本
      const textContent = startContainer.textContent
      beforeText = textContent.substring(0, startOffset)
      afterText = textContent.substring(startOffset)

      // 分割文本节点
      if (beforeText) {
        const beforeNode = document.createTextNode(beforeText)
        startContainer.parentNode.insertBefore(beforeNode, startContainer)
      }
      if (afterText) {
        startContainer.textContent = afterText
      } else {
        startContainer.parentNode.removeChild(startContainer)
      }
    }

    // 在光标位置插入标签元素
    const tagElement = document.createElement('span')
    tagElement.className = 'editor-tag'
    tagElement.contentEditable = 'false'
    tagElement.dataset.index = contentData.value.length

    // 根据 tag 的 type 获取颜色，如果没有匹配则使用默认颜色
    const tagColor = props.tagColors[newTag.type] || props.tagColors.default || '#409eff'
    tagElement.style.backgroundColor = tagColor

    const tagContent = document.createElement('span')
    tagContent.className = 'tag-content'
    tagContent.textContent = newTag.label
    tagElement.appendChild(tagContent)

    const deleteBtn = document.createElement('span')
    deleteBtn.className = 'tag-delete'
    deleteBtn.textContent = '×'
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation()
      e.preventDefault()
      deleteTag(parseInt(tagElement.dataset.index))
    })
    tagElement.appendChild(deleteBtn)

    tagElement.addEventListener('dblclick', (e) => {
      e.preventDefault()
      editTag(parseInt(tagElement.dataset.index))
    })

    // 找到正确的插入位置
    // 简化逻辑：直接使用 range 在光标位置插入
    console.log('Using range.insertNode to insert tag at cursor position')
    range.insertNode(tagElement)

    // 添加新标签到数据
    contentData.value.push(newTag)

    // 重新解析整个编辑器内容，确保数据同步
    const newContent = getEditorContent()
    contentData.value = newContent
  }

  emit('tag-add', newTag)
  emitChange()
  // 重新渲染以确保索引正确
  renderContent()

  // 将光标移到标签后面
  nextTick(() => {
    const selection = window.getSelection()
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      // 找到刚添加的标签后的位置
      const tags = editorRef.value.querySelectorAll('.editor-tag')
      const lastTag = tags[tags.length - 1]
      if (lastTag) {
        range.setStartAfter(lastTag)
        range.collapse(true)
        selection.removeAllRanges()
        selection.addRange(range)
      }
    }
  })

  return newTag
}

// 编辑标签（外部可调用）
const editTag = (index, tagData = null) => {
  const tag = contentData.value[index]
  if (!tag || tag.type === 'text') return

  if (tagData) {
    // 外部传入新数据
    contentData.value[index] = {
      ...tag,
      label: tagData.label || tag.label,
      value: tagData.value !== undefined ? tagData.value : tag.value,
      color: '#6c5fb1'
    }
    emit('tag-edit', index, contentData.value[index])
    emitChange()
    renderContent()
  } else {
    // 只触发编辑事件，让外部处理
    emit('tag-edit', index, tag)
  }
}

// 删除标签（外部可调用）
const deleteTag = (index) => {
  const tag = contentData.value[index]
  if (!tag) return

  contentData.value.splice(index, 1)
  emit('tag-delete', index, tag)
  emitChange()
  renderContent()
}

// 获取编辑器内容
const getEditorContent = () => {
  const editor = editorRef.value
  if (!editor) return []

  const result = []

  for (const child of editor.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent
      if (text && text !== '\u200B') {
        result.push({ type: 'text', label: text })
      }
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      if (child.classList.contains('editor-tag')) {
        const index = parseInt(child.dataset.index)
        if (contentData.value[index] && contentData.value[index].type !== 'text') {
          result.push(contentData.value[index])
        }
      } else if (child.tagName === 'BR') {
        result.push({ type: 'text', label: '\n' })
      }
    }
  }

  return result
}

// 拦截回车，用 <br> 代替默认的 <div>
const handleBeforeInput = (e) => {
  if (e.inputType === 'insertParagraph') {
    e.preventDefault()
    document.execCommand('insertLineBreak')
  }
}

// 处理编辑器输入
const handleInput = () => {
  const newContent = getEditorContent()
  contentData.value = newContent
  emitChange()
}

// 发送变更
const emitChange = () => {
  emit('update:modelValue', contentData.value)
  emit('change', contentData.value)
}

const handleBlur = (e) => {
  // 失去焦点时保存光标位置
  const selection = window.getSelection()
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0)
    if (editorRef.value && (editorRef.value.contains(range.commonAncestorContainer) ||
        editorRef.value === range.commonAncestorContainer)) {
      savedRange.value = range.cloneRange()
    }
  }
  emit('blur', e)
}

const handleFocus = (e) => {
  emit('focus', e)
}

// 清空内容（外部可调用）
const clearContent = () => {
  contentData.value = []
  renderContent()
  emitChange()
}

defineExpose({
  focus: () => editorRef.value?.focus(),
  blur: () => editorRef.value?.blur(),
  addTag,
  editTag,
  deleteTag,
  clearContent,
  getContent: () => contentData.value
})
</script>

<template>
  <div
    ref="editorRef"
    class="tagged-textarea-editor"
    :class="{ 'is-disabled': disabled }"
    :style="{ minHeight: minHeight }"
    :contenteditable="!disabled"
    :data-placeholder="placeholder"
    @beforeinput="handleBeforeInput"
    @input="handleInput"
    @blur="handleBlur"
    @focus="handleFocus"
  />
</template>

<style>
.tagged-textarea-editor {
  padding: 5px 11px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.5;
  color: #606266;
  background-color: #fff;
  box-sizing: border-box;    
  text-align: left;
}

.tagged-textarea-editor:focus {
  outline: none;
  border-color: #409eff;
}

.tagged-textarea-editor:empty::before {
  content: attr(data-placeholder);
  color: #c0c4cc;
}

.tagged-textarea-editor.is-disabled {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  color: #c0c4cc;
  cursor: not-allowed;
}

.tagged-textarea-editor .editor-tag {
  display: inline-flex;
  align-items: center;
  padding: 0 8px;
  margin: 0 4px;
  border-radius: 4px;
  color: white;
  font-size: 13px;
  line-height: 1.5;
  cursor: pointer;
  user-select: none;
  vertical-align: baseline;
  gap: 4px;
  height: 1.5em;
}

.tagged-textarea-editor .editor-tag .tag-content {
  display: inline-block;
}

.tagged-textarea-editor .tag-delete {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  font-size: 14px;
  cursor: pointer;
  opacity: 0.7;
  transition: all 0.2s;
  user-select: none;
}

.tagged-textarea-editor .tag-delete:hover {
  opacity: 1;
  background-color: rgba(255, 255, 255, 0.2);
}
</style>
