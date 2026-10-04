import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  TextInput,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { HouseholdTask, FamilyMember } from '../../types';
import { CheckCircle2, Circle, Clock, Plus, X } from 'lucide-react-native';

interface TasksTabProps {
  tasks?: HouseholdTask[];
  members: FamilyMember[];
  onToggleTask: (id: string) => void;
  onAddTask?: (task: HouseholdTask) => void;
}

export const TasksTab: React.FC<TasksTabProps> = ({
  tasks = [],
  members,
  onToggleTask,
  onAddTask,
}) => {
  const todayTasks: HouseholdTask[] = [
    {
      id: 'today-1',
      title: 'Lau dọn phòng khách',
      time: '10:15',
      assignedTo: 'Bé Bi',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150',
      tag: 'Nhà cửa',
      priority: true,
      completed: true,
    },
    {
      id: 'today-2',
      title: 'Đi siêu thị mua thực phẩm',
      time: '17:30 chiều',
      assignedTo: 'Bố Minh',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      tag: 'Cần thiết',
      priority: false,
      completed: false,
    },
  ];

  const upcomingTasks: HouseholdTask[] = [
    {
      id: 'up-1',
      title: 'Bảo dưỡng điều hòa & lọc nước',
      time: 'Thứ 7',
      assignedTo: 'Bố Minh',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      tag: 'Gia dụng',
      priority: false,
      completed: false,
    },
    {
      id: 'up-2',
      title: 'Đóng bảo hiểm sức khỏe gia đình',
      time: '15/11',
      assignedTo: 'Mẹ Lan',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
      tag: 'Tài chính',
      priority: false,
      completed: false,
    },
  ];

  const [localTodayTasks, setLocalTodayTasks] = useState<HouseholdTask[]>(() =>
    tasks.length > 0 ? tasks : todayTasks
  );
  const [localUpcomingTasks, setLocalUpcomingTasks] = useState<HouseholdTask[]>(upcomingTasks);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');
  const [selectedMember, setSelectedMember] = useState(members[0]?.name || 'Bố Minh');
  const [taskPriority, setTaskPriority] = useState(false);

  const formatDateText = (date: Date) =>
    date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const formatTimeText = (date: Date) =>
    date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });

  const formatTaskTimeText = (date: Date, time: Date) =>
    `${formatDateText(date)} • ${formatTimeText(time)}`;

  useEffect(() => {
    if (tasks.length > 0) {
      setLocalTodayTasks(tasks);
    }
  }, [tasks]);

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

  const handleCreateTask = () => {
    const member = members.find((item) => item.name === selectedMember) || members[0];
    const createdTask: HouseholdTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim() || 'Công việc mới',
      time: newTaskTime || formatTaskTimeText(selectedDate, selectedTime),
      assignedTo: member?.name || selectedMember,
      avatarUrl: member?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      tag: 'Gia đình',
      priority: taskPriority,
      completed: false,
    };

    setLocalTodayTasks((prev) => [createdTask, ...prev]);
    onAddTask?.(createdTask);
    setNewTaskTitle('');
    setNewTaskTime('');
    setSelectedDate(new Date());
    setSelectedTime(new Date());
    setSelectedMember(members[0]?.name || 'Bố Minh');
    setTaskPriority(false);
    setShowCreateModal(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View style={styles.header}>
          <Text style={styles.title}>Quản Lý Việc Nhà</Text>
          <Text style={styles.subtitle}>
            Phân công nhiệm vụ & chăm sóc tổ ấm gia đình
          </Text>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={() => setShowCreateModal(true)}>
          <Plus size={16} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Tạo việc</Text>
        </TouchableOpacity>
      </View>

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
                    <Image source={{ uri: t.avatarUrl }} style={styles.avatar} />
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

              {t.priority && (
                <View style={styles.rewardBadge}>
                  <Text style={styles.rewardText}>Ưu tiên</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

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
                    <Image source={{ uri: t.avatarUrl }} style={styles.avatar} />
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

      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowCreateModal(false)}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback onPress={(event) => event.stopPropagation()}>
              <View style={styles.modalCard}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Tạo công việc mới</Text>
                  <TouchableOpacity onPress={() => setShowCreateModal(false)} style={styles.closeButton}>
                    <X size={18} color="#64748B" />
                  </TouchableOpacity>
                </View>

                <View style={styles.form}>
                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>Tên công việc</Text>
                    <TextInput
                      value={newTaskTitle}
                      onChangeText={setNewTaskTitle}
                      placeholder="VD: Dọn phòng, đi chợ..."
                      placeholderTextColor="#94A3B8"
                      style={styles.input}
                    />
                  </View>

                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>Thời gian</Text>
                    <TouchableOpacity
                      style={styles.input}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Text style={styles.dateTimeText}>
                        {newTaskTime || 'Chọn ngày và giờ'}
                      </Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                      <DateTimePicker
                        value={selectedDate}
                        mode="date"
                        display="calendar"
                        onChange={(_event: any, date?: Date) => {
                          setShowDatePicker(false);
                          if (date) {
                            const nextDate = date;
                            setSelectedDate(nextDate);
                            setShowTimePicker(true);
                          }
                        }}
                      />
                    )}
                    {showTimePicker && (
                      <DateTimePicker
                        value={selectedTime}
                        mode="time"
                        display="default"
                        onChange={(_event: any, time?: Date) => {
                          setShowTimePicker(false);
                          if (time) {
                            const nextTime = time;
                            setSelectedTime(nextTime);
                            const taskTimeText = formatTaskTimeText(selectedDate, nextTime);
                            setNewTaskTime(taskTimeText);
                          }
                        }}
                      />
                    )}
                  </View>

                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>Phân công cho</Text>
                    <View style={styles.memberRow}>
                      {members.map((member) => (
                        <TouchableOpacity
                          key={member.id}
                          onPress={() => setSelectedMember(member.name)}
                          style={[styles.memberChip, selectedMember === member.name && styles.memberChipActive]}
                        >
                          <Text style={[styles.memberChipText, selectedMember === member.name && styles.memberChipTextActive]}>
                            {member.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => setTaskPriority((prev) => !prev)}
                    style={[styles.priorityToggle, taskPriority && styles.priorityToggleActive]}
                  >
                    <View style={[styles.priorityDot, taskPriority && styles.priorityDotActive]} />
                    <Text style={[styles.priorityText, taskPriority && styles.priorityTextActive]}>
                      {taskPriority ? 'Đánh dấu ưu tiên' : 'Không ưu tiên'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.submitButton} onPress={handleCreateTask}>
                    <Text style={styles.submitButtonText}>Lưu công việc</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  header: {
    flex: 1,
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0F766E',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#0F766E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  form: {
    gap: 16,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  dateTimeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  memberRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  memberChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  memberChipActive: {
    backgroundColor: '#E0F2FE',
    borderColor: '#7DD3FC',
  },
  memberChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  memberChipTextActive: {
    color: '#0369A1',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tagChipActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  tagChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  tagChipTextActive: {
    color: '#056839',
  },
  priorityToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  priorityToggleActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FCD34D',
  },
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#CBD5E1',
  },
  priorityDotActive: {
    backgroundColor: '#F59E0B',
  },
  priorityText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  priorityTextActive: {
    color: '#B45309',
  },
  submitButton: {
    backgroundColor: '#0F766E',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
