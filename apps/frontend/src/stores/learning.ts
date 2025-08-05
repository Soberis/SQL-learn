import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * 学习状态管理Store
 * 管理用户学习进度、成就、技能等数据
 */
export const useLearningStore = defineStore('learning', () => {
  // 用户基本信息
  const userInfo = ref({
    id: 1,
    name: 'SQL学习者',
    email: 'learner@example.com',
    avatar: '',
    level: 5,
    exp: 1300,
    nextLevelExp: 2000,
    totalPoints: 2450,
    joinDate: '2024-01-01',
  })

  // 学习统计
  const learningStats = ref({
    totalQuestions: 150,
    completedQuestions: 89,
    correctRate: 85,
    studyHours: 24,
    streakDays: 12,
    maxStreak: 15,
    practiceCount: 156,
    projectCount: 3,
    completedProjects: 2,
  })

  // 技能进度
  const skills = ref([
    {
      id: 'select',
      name: 'SELECT查询',
      category: 'basic',
      progress: 100,
      isCompleted: true,
      isLocked: false,
      completedQuestions: 15,
      totalQuestions: 15,
      points: 150,
      lastPracticed: '2024-01-05',
    },
    {
      id: 'where',
      name: 'WHERE筛选',
      category: 'basic',
      progress: 85,
      isCompleted: false,
      isLocked: false,
      completedQuestions: 12,
      totalQuestions: 15,
      points: 120,
      lastPracticed: '2024-01-04',
    },
    {
      id: 'join',
      name: 'JOIN连接',
      category: 'intermediate',
      progress: 45,
      isCompleted: false,
      isLocked: false,
      completedQuestions: 9,
      totalQuestions: 20,
      points: 180,
      lastPracticed: '2024-01-02',
    },
    {
      id: 'subquery',
      name: '子查询',
      category: 'advanced',
      progress: 0,
      isCompleted: false,
      isLocked: true,
      completedQuestions: 0,
      totalQuestions: 25,
      points: 250,
      lastPracticed: null,
    },
  ])

  // 成就系统
  const achievements = ref([
    {
      id: 'first-query',
      title: '初学者',
      description: '完成第一个SQL查询',
      icon: 'Trophy',
      category: 'milestone',
      progress: 100,
      current: 1,
      target: 1,
      unlocked: true,
      unlockedAt: '2024-01-01',
      isNew: false,
      points: 50,
    },
    {
      id: 'streak-7',
      title: '连续学习者',
      description: '连续学习7天',
      icon: 'Calendar',
      category: 'habit',
      progress: 100,
      current: 7,
      target: 7,
      unlocked: true,
      unlockedAt: '2024-01-04',
      isNew: true,
      points: 100,
    },
    {
      id: 'query-master',
      title: '查询大师',
      description: '完成100个查询题目',
      icon: 'Star',
      category: 'progress',
      progress: 89,
      current: 89,
      target: 100,
      unlocked: false,
      unlockedAt: null,
      isNew: false,
      points: 200,
    },
    {
      id: 'project-expert',
      title: '项目专家',
      description: '完成5个实战项目',
      icon: 'Suitcase',
      category: 'project',
      progress: 60,
      current: 3,
      target: 5,
      unlocked: false,
      unlockedAt: null,
      isNew: false,
      points: 300,
    },
  ])

  // 学习历史
  const learningHistory = ref([
    {
      id: 1,
      date: '2024-01-05',
      type: 'practice',
      title: 'WHERE条件筛选练习',
      duration: 25,
      score: 90,
      questionsCompleted: 5,
      pointsEarned: 45,
    },
    {
      id: 2,
      date: '2024-01-04',
      type: 'project',
      title: '电商数据分析项目',
      duration: 120,
      score: 85,
      questionsCompleted: 0,
      pointsEarned: 150,
    },
    {
      id: 3,
      date: '2024-01-03',
      type: 'practice',
      title: 'JOIN连接查询',
      duration: 35,
      score: 75,
      questionsCompleted: 3,
      pointsEarned: 30,
    },
  ])

  // 当前学习会话
  const currentSession = ref({
    startTime: null as Date | null,
    endTime: null as Date | null,
    duration: 0,
    questionsAttempted: 0,
    questionsCorrect: 0,
    pointsEarned: 0,
    skillsPracticed: [] as string[],
    isActive: false,
  })

  // 学习建议
  const recommendations = ref([
    {
      id: 1,
      type: 'practice',
      title: '继续练习WHERE筛选',
      description: '你在WHERE条件筛选方面还有提升空间，建议多做几道相关练习题',
      priority: 'high',
      skillId: 'where',
      actionText: '开始练习',
      actionType: 'primary',
    },
    {
      id: 2,
      type: 'project',
      title: '尝试新的实战项目',
      description: '基于你当前的技能水平，推荐开始「电商数据分析」项目',
      priority: 'medium',
      skillId: null,
      actionText: '查看项目',
      actionType: 'success',
    },
    {
      id: 3,
      type: 'review',
      title: '复习JOIN连接',
      description: '距离上次学习JOIN已经3天了，建议复习巩固相关知识',
      priority: 'low',
      skillId: 'join',
      actionText: '开始复习',
      actionType: 'warning',
    },
  ])

  // 计算属性
  const levelProgress = computed(() => {
    return Math.round((userInfo.value.exp / userInfo.value.nextLevelExp) * 100)
  })

  const overallProgress = computed(() => {
    const totalProgress = skills.value.reduce((sum, skill) => sum + skill.progress, 0)
    return Math.round(totalProgress / skills.value.length)
  })

  const unlockedAchievements = computed(() => {
    return achievements.value.filter(achievement => achievement.unlocked)
  })

  const newAchievements = computed(() => {
    return achievements.value.filter(achievement => achievement.isNew)
  })

  const basicSkills = computed(() => {
    return skills.value.filter(skill => skill.category === 'basic')
  })

  const intermediateSkills = computed(() => {
    return skills.value.filter(skill => skill.category === 'intermediate')
  })

  const advancedSkills = computed(() => {
    return skills.value.filter(skill => skill.category === 'advanced')
  })

  const todayStats = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    const todayHistory = learningHistory.value.filter(item => item.date === today)

    return {
      duration: todayHistory.reduce((sum, item) => sum + item.duration, 0),
      questionsCompleted: todayHistory.reduce((sum, item) => sum + item.questionsCompleted, 0),
      pointsEarned: todayHistory.reduce((sum, item) => sum + item.pointsEarned, 0),
      activitiesCount: todayHistory.length,
    }
  })

  // 方法
  const startLearningSession = () => {
    currentSession.value = {
      startTime: new Date(),
      endTime: null,
      duration: 0,
      questionsAttempted: 0,
      questionsCorrect: 0,
      pointsEarned: 0,
      skillsPracticed: [],
      isActive: true,
    }
  }

  const endLearningSession = () => {
    if (currentSession.value.isActive && currentSession.value.startTime) {
      currentSession.value.endTime = new Date()
      currentSession.value.duration = Math.round(
        (currentSession.value.endTime.getTime() - currentSession.value.startTime.getTime()) / 1000 / 60
      )
      currentSession.value.isActive = false

      // 添加到学习历史
      addLearningHistory({
        type: 'practice',
        title: '学习会话',
        duration: currentSession.value.duration,
        score:
          currentSession.value.questionsAttempted > 0
            ? Math.round((currentSession.value.questionsCorrect / currentSession.value.questionsAttempted) * 100)
            : 0,
        questionsCompleted: currentSession.value.questionsCorrect,
        pointsEarned: currentSession.value.pointsEarned,
      })
    }
  }

  const updateSkillProgress = (skillId: string, progress: number) => {
    const skill = skills.value.find(s => s.id === skillId)
    if (skill) {
      skill.progress = Math.min(100, Math.max(0, progress))
      skill.isCompleted = skill.progress === 100
      skill.lastPracticed = new Date().toISOString().split('T')[0]

      // 更新完成题目数
      skill.completedQuestions = Math.round((skill.progress / 100) * skill.totalQuestions)

      // 检查是否解锁新技能
      checkSkillUnlocks()

      // 检查成就
      checkAchievements()
    }
  }

  const addExperience = (exp: number) => {
    userInfo.value.exp += exp
    userInfo.value.totalPoints += exp

    // 检查是否升级
    while (userInfo.value.exp >= userInfo.value.nextLevelExp) {
      userInfo.value.exp -= userInfo.value.nextLevelExp
      userInfo.value.level += 1
      userInfo.value.nextLevelExp = Math.round(userInfo.value.nextLevelExp * 1.2)

      // 触发升级事件
      onLevelUp()
    }
  }

  const unlockAchievement = (achievementId: string) => {
    const achievement = achievements.value.find(a => a.id === achievementId)
    if (achievement && !achievement.unlocked) {
      achievement.unlocked = true
      achievement.unlockedAt = new Date().toISOString().split('T')[0]
      achievement.isNew = true

      // 添加经验值
      addExperience(achievement.points)

      return achievement
    }
    return null
  }

  const markAchievementAsRead = (achievementId: string) => {
    const achievement = achievements.value.find(a => a.id === achievementId)
    if (achievement) {
      achievement.isNew = false
    }
  }

  const addLearningHistory = (activity: {
    type: string
    title: string
    duration: number
    score: number
    questionsCompleted: number
    pointsEarned: number
  }) => {
    const newActivity = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      ...activity,
    }

    learningHistory.value.unshift(newActivity)

    // 保持历史记录在合理范围内
    if (learningHistory.value.length > 100) {
      learningHistory.value = learningHistory.value.slice(0, 100)
    }

    // 更新统计数据
    updateLearningStats(activity)
  }

  const updateLearningStats = (activity: {
    type: string
    duration: number
    questionsCompleted: number
    pointsEarned: number
  }) => {
    learningStats.value.studyHours += Math.round((activity.duration / 60) * 10) / 10
    learningStats.value.completedQuestions += activity.questionsCompleted
    learningStats.value.practiceCount += 1

    if (activity.type === 'project') {
      learningStats.value.projectCount += 1
    }

    // 更新正确率
    if (learningStats.value.totalQuestions > 0) {
      learningStats.value.correctRate = Math.round(
        (learningStats.value.completedQuestions / learningStats.value.totalQuestions) * 100
      )
    }
  }

  const checkSkillUnlocks = () => {
    // 检查技能解锁条件
    skills.value.forEach(skill => {
      if (skill.isLocked) {
        // 根据前置技能完成情况解锁
        const prerequisites = getSkillPrerequisites(skill.id)
        const canUnlock = prerequisites.every(prereqId => {
          const prereq = skills.value.find(s => s.id === prereqId)
          return prereq && prereq.isCompleted
        })

        if (canUnlock) {
          skill.isLocked = false
        }
      }
    })
  }

  const checkAchievements = () => {
    // 检查各种成就条件
    achievements.value.forEach(achievement => {
      if (!achievement.unlocked) {
        let shouldUnlock = false

        switch (achievement.id) {
          case 'query-master':
            achievement.current = learningStats.value.completedQuestions
            achievement.progress = Math.round((achievement.current / achievement.target) * 100)
            shouldUnlock = achievement.current >= achievement.target
            break

          case 'project-expert':
            achievement.current = learningStats.value.completedProjects
            achievement.progress = Math.round((achievement.current / achievement.target) * 100)
            shouldUnlock = achievement.current >= achievement.target
            break

          case 'streak-30':
            achievement.current = learningStats.value.streakDays
            achievement.progress = Math.round((achievement.current / achievement.target) * 100)
            shouldUnlock = achievement.current >= achievement.target
            break
        }

        if (shouldUnlock) {
          unlockAchievement(achievement.id)
        }
      }
    })
  }

  const getSkillPrerequisites = (skillId: string): string[] => {
    // 定义技能前置条件
    const prerequisites: Record<string, string[]> = {
      join: ['select', 'where'],
      subquery: ['select', 'where', 'join'],
      window: ['select', 'where', 'join', 'groupby'],
      optimization: ['select', 'where', 'join', 'subquery'],
    }

    return prerequisites[skillId] || []
  }

  const onLevelUp = () => {
    // 升级时的处理逻辑
    console.log(`恭喜升级到 ${userInfo.value.level} 级！`)

    // 可以在这里触发升级动画、解锁新功能等
  }

  const updateStreak = () => {
    // 更新连续学习天数
    const today = new Date().toISOString().split('T')[0]
    const todayActivities = learningHistory.value.filter(item => item.date === today)

    if (todayActivities.length > 0) {
      // 今天有学习活动，检查昨天是否也有
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const yesterdayActivities = learningHistory.value.filter(item => item.date === yesterday)

      if (yesterdayActivities.length > 0 || learningStats.value.streakDays === 0) {
        learningStats.value.streakDays += 1
        learningStats.value.maxStreak = Math.max(learningStats.value.maxStreak, learningStats.value.streakDays)
      } else {
        learningStats.value.streakDays = 1
      }
    }
  }

  const resetProgress = () => {
    // 重置学习进度（用于测试或重新开始）
    skills.value.forEach(skill => {
      skill.progress = 0
      skill.isCompleted = false
      skill.completedQuestions = 0
      skill.lastPracticed = null
    })

    achievements.value.forEach(achievement => {
      achievement.unlocked = false
      achievement.unlockedAt = null
      achievement.isNew = false
      achievement.current = 0
      achievement.progress = 0
    })

    learningStats.value = {
      totalQuestions: 0,
      completedQuestions: 0,
      correctRate: 0,
      studyHours: 0,
      streakDays: 0,
      maxStreak: 0,
      practiceCount: 0,
      projectCount: 0,
      completedProjects: 0,
    }

    userInfo.value.level = 1
    userInfo.value.exp = 0
    userInfo.value.nextLevelExp = 1000
    userInfo.value.totalPoints = 0

    learningHistory.value = []
  }

  return {
    // 状态
    userInfo,
    learningStats,
    skills,
    achievements,
    learningHistory,
    currentSession,
    recommendations,

    // 计算属性
    levelProgress,
    overallProgress,
    unlockedAchievements,
    newAchievements,
    basicSkills,
    intermediateSkills,
    advancedSkills,
    todayStats,

    // 方法
    startLearningSession,
    endLearningSession,
    updateSkillProgress,
    addExperience,
    unlockAchievement,
    markAchievementAsRead,
    addLearningHistory,
    updateLearningStats,
    checkSkillUnlocks,
    checkAchievements,
    updateStreak,
    resetProgress,
  }
})
