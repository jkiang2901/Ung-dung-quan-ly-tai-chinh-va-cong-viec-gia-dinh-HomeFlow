import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import type { HouseholdTask } from '../types';
import { Clock, CheckCircle2, Circle } from 'lucide-react-native';

interface TodayTasksProps {
  tasks: HouseholdTask[];
  onToggleTask: (id: string) => void;
  onViewAll?: () => void;
}

export const TodayTasks: React.FC<TodayTasksProps> = ({ tasks, onToggleTask, onViewAll }) => {
  const formatMoney = (val: number) => val.toLocaleString('vi-VN');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.sectionTitle}>Việc nhà hôm nay</Text>
          <View style={styles.badgeCount}>
            <Text style={styles.badgeText}>
              {tasks.filter((t) => !t.completed).length}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={onViewAll} activeOpacity={0.7}>
          <Text style={styles.viewAllText}>Xem tất cả ›</Text>
        </TouchableOpacity>
      </View>

      {/* Task List */}
      <View style={styles.taskList}>
        {tasks.map((task) => (
          <TouchableOpacity
            key={task.id}
            onPress={() => onToggleTask(task.id)}
            activeOpacity={0.8}
            style={[
              styles.taskCard,
              task.completed && styles.taskCompletedCard,
            ]}
          >
            <View style={styles.taskContent}>
              {/* Checkbox Icon */}
              <TouchableOpacity
                onPress={() => onToggleTask(task.id)}
                style={styles.checkboxButton}
              >
                {task.completed ? (
                  <CheckCircle2 size={24} color="#10B981" />
                ) : (
                  <Circle size={24} color="#A5B4FC" strokeWidth={1.8} />
                )}
              </TouchableOpacity>

              <View style={styles.taskInfo}>
                <Text
                  style={[
                    styles.taskTitle,
                    task.completed && styles.taskTitleCompleted,
                  ]}
                  numberOfLines={2}
                >
                  {task.title}
                </Text>

                <View style={styles.metaRow}>
                  {task.time && (
                    <View style={styles.timeBadge}>
                      <Clock size={12} color="#EA580C" />
                      <Text style={styles.timeText}>{task.time}</Text>
                    </View>
                  )}
                  {task.amount && (
                    <View style={styles.amountBadge}>
                      <Text style={styles.amountText}>
                        💵 {formatMoney(task.amount)} đ
                      </Text>
                    </View>
                  )}

                  <View style={styles.assignedRow}>
                    {task.avatarUrl && (
                      <Image
                        source={{ uri: task.avatarUrl }}
                        style={styles.assignedAvatar}
                      />
                    )}
                    <Text style={styles.assignedName}>{task.assignedTo}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Tag Badge */}
            {task.tag && (
              <View
                style={[
                  styles.tagBadge,
                  task.priority ? styles.tagPriority : styles.tagNormal,
                ]}
              >
                <Text
                  style={[
                    styles.tagText,
                    task.priority ? styles.tagTextPriority : styles.tagTextNormal,
                  ]}
                >
                  {task.tag}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  badgeCount: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#EA580C',
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  taskCompletedCard: {
    backgroundColor: '#F8FAFC',
    opacity: 0.7,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 12,
    marginRight: 8,
  },
  checkboxButton: {
    marginTop: 2,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 20,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EA580C',
  },
  amountBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  amountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },
  assignedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  assignedAvatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  assignedName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  tagBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagPriority: {
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FFE4E6',
  },
  tagNormal: {
    backgroundColor: '#F1F5F9',
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  tagTextPriority: {
    color: '#E11D48',
  },
  tagTextNormal: {
    color: '#475569',
  },
});
