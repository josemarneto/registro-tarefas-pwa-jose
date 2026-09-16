<template>
  <div>
    <p v-if="store.error" class="error-message">{{ store.error }}</p>

    <TaskForm
      :editing-task="editingTask"
      @add="handleAdd"
      @update="handleUpdate"
      @cancel="handleCancel"
    />

    <p v-if="store.loading" class="loading-message">Carregando tarefas...</p>

    <template v-else>
      <label class="location-filter">
        <input v-model="onlyWithLocation" type="checkbox" />
        Somente com localização
      </label>

      <section v-if="pendingTasks.length > 0">
        <h2 class="section-title">Pendentes ({{ pendingTasks.length }})</h2>
        <TaskItem
          v-for="task in pendingTasks"
          :key="task.id"
          :task="task"
          :expanded="isExpanded(task.id)"
          @toggle="handleToggle"
          @remove="handleRemove"
          @edit="handleEdit"
          @expand="toggleExpanded"
        />
        <template v-for="task in pendingTasks" :key="`pending-map-${task.id}`">
          <TaskLocationMap
            v-if="isExpanded(task.id) && task.latitude != null"
            :location="taskLocation(task)"
          />
        </template>
      </section>

      <section v-if="completedTasks.length > 0">
        <h2 class="section-title">Concluídas ({{ completedTasks.length }})</h2>
        <TaskItem
          v-for="task in completedTasks"
          :key="task.id"
          :task="task"
          :expanded="isExpanded(task.id)"
          @toggle="handleToggle"
          @remove="handleRemove"
          @edit="handleEdit"
          @expand="toggleExpanded"
        />
        <template v-for="task in completedTasks" :key="`completed-map-${task.id}`">
          <TaskLocationMap
            v-if="isExpanded(task.id) && task.latitude != null"
            :location="taskLocation(task)"
          />
        </template>
      </section>

      <p v-if="filteredTasks.length === 0" class="empty-message">
        Nenhuma tarefa cadastrada. Adicione uma acima.
      </p>
    </template>

    <InstallButton />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import TaskForm from '../components/TaskForm.vue'
import TaskItem from '../components/TaskItem.vue'
import InstallButton from '../components/InstallButton.vue'
import TaskLocationMap from '../components/TaskLocationMap.vue'
import { useTasksStore } from '../stores/tasks.js'

const store = useTasksStore()
const editingTask = ref(null)
const onlyWithLocation = ref(false)
const expandedTaskId = ref(null)
const filteredTasks = computed(() =>
  onlyWithLocation.value ? store.tasks.filter((task) => task.latitude != null) : store.tasks,
)
const pendingTasks = computed(() => filteredTasks.value.filter((task) => !task.done))
const completedTasks = computed(() => filteredTasks.value.filter((task) => task.done))

onMounted(() => {
  store.fetchTasks()
})

function handleAdd(payload) {
  store.addTask(payload)
}

function handleUpdate(id, titleOrPayload, imgAttachmentKey) {
  if (titleOrPayload && typeof titleOrPayload === 'object') {
    const payload = titleOrPayload
    store.updateTask(id, {
      title: payload.title,
      imgAttachmentKey: payload.img_attachment_key ?? payload.imgAttachmentKey,
      latitude: payload.latitude,
      longitude: payload.longitude,
      geolocation_accuracy: payload.geolocation_accuracy,
      geolocation_timestamp: payload.geolocation_timestamp,
      location_label: payload.location_label,
    })
  } else {
    store.updateTask(id, { title: titleOrPayload, imgAttachmentKey })
  }
  editingTask.value = null
}

function handleCancel() {
  editingTask.value = null
}

function handleEdit(task) {
  editingTask.value = task
}

function handleToggle(id) {
  store.toggleTask(id)
}

function handleRemove(id) {
  if (editingTask.value?.id === id) editingTask.value = null
  store.removeTask(id)
}

function toggleExpanded(id) {
  expandedTaskId.value = expandedTaskId.value === id ? null : id
}

function isExpanded(id) {
  return expandedTaskId.value === id
}

function taskLocation(task) {
  return {
    latitude: task.latitude,
    longitude: task.longitude,
    accuracy: task.geolocation_accuracy,
    label: task.location_label,
  }
}
</script>

<style scoped>
.section-title {
  font-size: 1rem;
  color: #666;
  margin-bottom: 12px;
  margin-top: 20px;
}

.empty-message {
  text-align: center;
  color: #999;
  margin-top: 40px;
  font-size: 0.95rem;
}

.error-message {
  color: #c0392b;
  background-color: #fdecea;
  border: 1px solid #e74c3c;
  border-radius: 6px;
  padding: 10px 14px;
  margin-bottom: 12px;
  font-size: 0.9rem;
}

.loading-message {
  color: #666;
  font-size: 0.9rem;
  padding: 8px 0;
}

.location-filter {
  display: block;
  margin: 12px 0;
  color: #555;
  font-size: 0.9rem;
}
</style>
