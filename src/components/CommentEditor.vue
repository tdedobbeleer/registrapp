<template>
  <div class="comment-editor">
    <div v-if="!isEditing" @click="startEditing" class="comment-display" v-html="comment ? comment.replace(/\n/g, '<br>') : $t('registrations.addComment')">
    </div>
    <div v-else class="comment-edit">
      <textarea
        v-model="tempComment"
        @blur="saveComment"
        @keydown.esc="cancelEditing"
        ref="textarea"
        :maxlength="500"
        rows="3"
        class="form-control"
      ></textarea>
      <div class="edit-controls">
        <div class="char-count">{{ tempComment.length }}/500</div>
        <button @click="saveComment" class="btn btn-sm btn-primary save-btn">{{ $t('registrations.save') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'

interface Props {
  comment?: string
  onSave: (comment: string) => void
}

const props = defineProps<Props>()

const isEditing = ref(false)
const tempComment = ref('')
const textarea = ref<HTMLTextAreaElement>()

const startEditing = () => {
  isEditing.value = true
  tempComment.value = props.comment || ''
  nextTick(() => {
    if (textarea.value) {
      textarea.value.focus()
      textarea.value.setSelectionRange(tempComment.value.length, tempComment.value.length)
    }
  })
}

const saveComment = () => {
  // Sanitize the comment: trim whitespace and remove trailing newlines
  const sanitizedComment = tempComment.value.trim().replace(/\n+$/, '')
  props.onSave(sanitizedComment)
  isEditing.value = false
}

const cancelEditing = () => {
  isEditing.value = false
}
</script>

<style scoped>
.comment-editor {
  cursor: pointer;
}

.comment-display {
  min-height: 2rem;
  padding: 0.5rem;
  border: 1px solid transparent;
  border-radius: 0.25rem;
  font-style: italic;
}

.comment-display:hover {
  border-color: #dee2e6;
}

.comment-edit {
  position: relative;
}

.edit-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
}

.char-count {
  font-size: 0.75rem;
  color: #6c757d;
}

.save-btn {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}
</style>