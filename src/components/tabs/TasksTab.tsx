import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet } from 'react-native';
import type { HouseholdTask, FamilyMember } from '../../types';
import { CheckCircle2, Circle, Clock } from 'lucide-react-native';

interface TasksTabProps {
  tasks?: HouseholdTask[];
  members: FamilyMember[];
  onToggleTask: (id: string) => void;
  onAddTask?: (task: HouseholdTask) => void;
}

export const TasksTab: React.FC<TasksTabProps> = ({
  tasks = [],
  onToggleTask,
}) => {
  const todayTasks = [
    {
      id: 'today-1',
      title: 'Lau dọn phòng khách',
      completed: true,
      completedTime: '10:15',
      assignedTo: 'Bé Bon',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150',
      reward: '+20k sao',
    },
    {
      id: 'today-2',
      title: 'Đi siêu thị mua thực phẩm...',
      completed: false,
      time: '17:30 chiều',
      assignedTo: 'Bố Minh',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      tag: 'Cần thiết',
    },
  ];

  const upcomingTasks = [
    {
      id: 'up-1',
      title: 'Bảo dưỡng điều hòa & lọc nước',
      completed: false,
      dateLabel: 'Thứ 7',
      assignedTo: 'Bố Minh',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      tag: 'Gia dụng',
    },
    {
      id: 'up-2',
      title: 'Đóng bảo hiểm sức khỏe gia đình...',
      completed: false,
      dateLabel: '15/11',
      assignedTo: 'Mẹ Lan',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
      tag: 'Tài chính',
    },
  ];

  const [localTodayTasks, setLocalTodayTasks] = useState(todayTasks);
  const [localUpcomingTasks, setLocalUpcomingTasks] = useState(upcomingTasks);

  const toggleTodayTask = (id: string) => {
    setLocalTodayTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
    onToggleTask(id);
  };

  const toggleUpcomingTask = (id: string) => {
    setLocalUpcomingTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Quản Lý Việc Nhà</Text>
        <Text style={styles.subtitle}>
          Phân công nhiệm vụ & chăm sóc tổ ấm gia đình
        </Text>
      </View>

      {/* Today Tasks Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nhiệm vụ hôm nay</Text>
        <View style={styles.taskList}>
          {localTodayTasks.map((t) => (
            <TouchableOpacity
              key={t.id}
              onPress={() => toggleTodayTask(t.id)}
              activeOpacity={0.8}
              style={[styles.taskCard, t.completed && styles.completedCard]}
            >
              <View style={styles.taskLeft}>
                <TouchableOpacity onPress={() => toggleTodayTask(t.id)}>
                  {t.completed ? (
                    <CheckCircle2 size={24} color="#10B981" />
                  ) : (
                    <Circle size={24} color="#A5B4FC" strokeWidth={1.8} />
                  )}
                </TouchableOpacity>
                <View style={styles.taskTextGroup}>
                  <Text style={[styles.taskTitle, t.completed && styles.completedText]}>
                    {t.title}
                  </Text>
                  <View style={styles.metaRow}>
                    <Image source={{ uri: t.avatar }} style={styles.avatar} />
                    <Text style={styles.assigneeName}>{t.assignedTo}</Text>
                    {t.time && (
                      <View style={styles.timeBadge}>
                        <Clock size={11} color="#EA580C" />
                        <Text style={styles.timeText}>{t.time}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {t.reward && (
                <View style={styles.rewardBadge}>
                  <Text style={styles.rewardText}>{t.reward}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Upcoming Tasks Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sắp tới</Text>
        <View style={styles.taskList}>
          {localUpcomingTasks.map((t) => (
            <TouchableOpacity
              key={t.id}
              onPress={() => toggleUpcomingTask(t.id)}
              activeOpacity={0.8}
              style={[styles.taskCard, t.completed && styles.completedCard]}
            >
              <View style={styles.taskLeft}>
                <TouchableOpacity onPress={() => toggleUpcomingTask(t.id)}>
                  {t.completed ? (
                    <CheckCircle2 size={24} color="#10B981" />
                  ) : (
                    <Circle size={24} color="#A5B4FC" strokeWidth={1.8} />
                  )}
                </TouchableOpacity>
                <View style={styles.taskTextGroup}>
                  <Text style={[styles.taskTitle, t.completed && styles.completedText]}>
                    {t.title}
                  </Text>
                  <View style={styles.metaRow}>
                    <Image source={{ uri: t.avatar }} style={styles.avatar} />
                    <Text style={styles.assigneeName}>{t.assignedTo}</Text>
                  </View>
                </View>
              </View>

              {t.tag && (
                <View style={styles.tagBadge}>
                  <Text style={styles.tagText}>{t.tag}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
    gap: 20,
  },
  header: {
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  taskList: {
    gap: 10,
  },
  taskCard: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  completedCard: {
    backgroundColor: '#F8FAFC',
    opacity: 0.7,
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  taskTextGroup: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  avatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  assigneeName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 4,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EA580C',
  },
  rewardBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rewardText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#056839',
  },
  tagBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
});
