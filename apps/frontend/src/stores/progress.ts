import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * 进度记录接口
 */
interface ProgressRecord {
  id: string
  exercise_id: string
  is_completed: boolean
  score: number | null
  completed_at: string | null
}

/**
 * 进度统计接口
 */
interface ProgressStats {
  total_completed: number
  average_score: number
  completion_rate: number
}

/**
 * 进度管理 Store
 * 简化版本，只保留基本的进度跟踪功能
 */
export const useProgressStore = defineStore('progress', () => {
  // 基本状态
  const progressRecords = ref<ProgressRecord[]>([])
  const isLoading = ref(false)

  // 计算属性
  const totalCompleted = computed(() => {
    return progressRecords.value.filter(record => record.is_completed).length
  })

  const averageScore = computed(() => {
    const completedRecords = progressRecords.value.filter(
      record => record.is_completed && record.score !== null
    )
    if (completedRecords.length === 0) return 0

    const totalScore = completedRecords.reduce((sum, record) => sum + (record.score || 0), 0)
    return Math.round(totalScore / completedRecords.length)
  })

  const completionRate = computed(() => {
    if (progressRecords.value.length === 0) return 0
    return Math.round((totalCompleted.value / progressRecords.value.length) * 100)
  })

  const progressStats = computed((): ProgressStats => ({
    total_completed: totalCompleted.value,
    average_score: averageScore.value,
    completion_rate: completionRate.value
  }))

  /**
   * 获取练习的进度记录
   * @param exerciseId 练习ID
   * @returns 进度记录或null
   */
  const getExerciseProgress = (exerciseId: string): ProgressRecord | null => {
    return progressRecords.value.find(record => record.exercise_id === exerciseId) || null
  }

  /**
   * 检查练习是否已完成
   * @param exerciseId 练习ID
   * @returns 是否已完成
   */
  const isExerciseCompleted = (exerciseId: string): boolean => {
    const progress = getExerciseProgress(exerciseId)
    return progress?.is_completed || false
  }

  /**
   * 获取练习得分
   * @param exerciseId 练习ID
   * @returns 得分或null
   */
  const getExerciseScore = (exerciseId: string): number | null => {
    const progress = getExerciseProgress(exerciseId)
    return progress?.score || null
  }

  /**
   * 记录练习完成情况
   * @param exerciseId 练习ID
   * @param score 得分
   */
  const recordProgress = (exerciseId: string, score: number) => {
    const existingIndex = progressRecords.value.findIndex(
      record => record.exercise_id === exerciseId
    )

    const progressRecord: ProgressRecord = {
      id: existingIndex >= 0 ? progressRecords.value[existingIndex].id : Date.now().toString(),
      exercise_id: exerciseId,
      is_completed: true,
      score,
      completed_at: new Date().toISOString()
    }

    if (existingIndex >= 0) {
      progressRecords.value[existingIndex] = progressRecord
    } else {
      progressRecords.value.push(progressRecord)
    }
  }

  /**
   * 重置练习进度
   * @param exerciseId 练习ID
   */
  const resetExerciseProgress = (exerciseId: string) => {
    const index = progressRecords.value.findIndex(
      record => record.exercise_id === exerciseId
    )
    if (index >= 0) {
      progressRecords.value.splice(index, 1)
    }
  }

  /**
   * 重置所有状态
   */
  const reset = () => {
    progressRecords.value = []
    isLoading.value = false
  }

  return {
    // 状态
    progressRecords,
    isLoading,

    // 计算属性
    totalCompleted,
    averageScore,
    completionRate,
    progressStats,

    // 方法
    getExerciseProgress,
    isExerciseCompleted,
    getExerciseScore,
    recordProgress,
    resetExerciseProgress,
    reset
  }
})
