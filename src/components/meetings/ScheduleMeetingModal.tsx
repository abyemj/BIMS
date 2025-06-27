
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { globalStyles, colors, spacing, typography } from '@/styles/globalStyles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { databases } from '@/lib/appwrite';
import type { User, Meeting } from '@/types';
import { Query } from 'appwrite';
import { format } from 'date-fns';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

interface ScheduleMeetingModalProps {
  visible: boolean;
  onClose: () => void;
  onSchedule: (meetingData: any) => Promise<boolean>;
  initialData?: Meeting;
}

const durations = [
  { label: '30 minutes', value: 30 },
  { label: '45 minutes', value: 45 },
  { label: '1 hour', value: 60 },
  { label: '1.5 hours', value: 90 },
  { label: '2 hours', value: 120 },
];

const statusOptions: { label: string; value: Meeting['status'] }[] = [
  { label: 'Scheduled', value: 'Scheduled' },
  { label: 'Ongoing', value: 'Ongoing' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Archived', value: 'Archived' },
];

export default function ScheduleMeetingModal({ visible, onClose, onSchedule, initialData }: ScheduleMeetingModalProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState(initialData?.title || '');
  const [date, setDate] = useState<Date>(initialData?.date ? new Date(initialData.date) : new Date());
  const [time, setTime] = useState<Date>(initialData?.time ? new Date(initialData.time) : new Date());
  const [duration, setDuration] = useState(initialData?.duration || 60);
  const [agenda, setAgenda] = useState(initialData?.agenda || '');
  const [instructions, setInstructions] = useState(initialData?.instructions || '');
  const [status, setStatus] = useState<Meeting['status']>(initialData?.status || 'Scheduled');
  const [invitedDelegates, setInvitedDelegates] = useState<string[]>(initialData?.invitedDelegates || []);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user?.tenant) return;
      
      try {
        setLoadingUsers(true);
        setUsersError(null);
        
        const response = await databases.listDocuments(
          '6848228c00222dfaf82e',
          '68597845003de1b5dcc0',
          [
            Query.equal('tenant', user.tenant),
            Query.equal('status', 'Active'),
            Query.equal('role', 'Delegate')
          ]
        );
  
        // Map to User type with consistent ID handling
        const delegateUsers = response.documents.map(doc => ({
          id: doc.$id, // Using database document ID
          authId: doc.authId || doc.$id, // Include auth ID if available
          fullName: doc.name,
          email: doc.email,
          phone: doc.phone,
          role: doc.role,
          portfolio: doc.portfolio,
          status: doc.status,
          tenant: doc.tenant
        }));
  
        setUsers(delegateUsers);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        setUsersError('Could not load users. Please try again.');
      } finally {
        setLoadingUsers(false);
      }
    };
  
    if (visible) {
      fetchUsers();
    }
  }, [visible, user?.tenant]);

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const onTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  const handleToggleDelegate = (userId: string) => {
    setInvitedDelegates(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };


  const handleAddAllDelegates = () => {
    // Create a Set for faster lookups
    const currentSelected = new Set(invitedDelegates);
    const allUserIds = users.map(user => user.id);
    
    // If some are already selected, deselect all
    if (users.length === invitedDelegates.length) {
      setInvitedDelegates([]);
    } else {
      // Select all (including any previously selected)
      setInvitedDelegates([...new Set([...invitedDelegates, ...allUserIds])]);
    }
  };

 

  const handleSubmit = async () => {
    if (!title || !agenda) {
      Alert.alert('Required fields', 'Please fill in all required fields');
      return;
    }
  
    // Combine date and time into a single Date object
    const meetingDateTime = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      time.getHours(),
      time.getMinutes()
    );
  
    const meetingData = {
      title,
      date: meetingDateTime, // Now using combined datetime
      duration,
      agenda,
      instructions,
      meetingLink: '', // Will be set by handleScheduleMeeting
      invitedDelegates,
      tenant: user?.tenant,
    };
  
    try {
      const success = await onSchedule(meetingData);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error("Error scheduling meeting:", error);
      Alert.alert('Error', 'Could not schedule the meeting. Please try again.');
    }
  };


  

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Meeting Title */}
      <TextInput
        style={globalStyles.input}
        placeholder="Meeting Title*"
        value={title}
        onChangeText={setTitle}
        placeholderTextColor={colors.muted}
        // blurOnSubmit={false} // Prevent keyboard from dismissing
        returnKeyType="next" // Show "next" button
        onSubmitEditing={() => {
          // Optionally focus next field
          // agendaInputRef.current?.focus();
        }}
      />
      
      {/* Agenda */}
      <TextInput 
        style={globalStyles.input} 
        placeholder="Agenda*" 
        value={agenda} 
        onChangeText={setAgenda} 
        multiline 
        placeholderTextColor={colors.muted}
        blurOnSubmit={false}
        returnKeyType="next"
        onSubmitEditing={() => {
          // Optionally focus next field
          // agendaInputRef.current?.focus();
        }}
      />
      
      {/* Instructions */}
      <TextInput 
        style={globalStyles.input} 
        placeholder="Instructions (Optional)" 
        value={instructions} 
        onChangeText={setInstructions} 
        multiline 
        placeholderTextColor={colors.muted}
        blurOnSubmit={false}
        returnKeyType="next"
        onSubmitEditing={() => {
          // Optionally focus next field
          // agendaInputRef.current?.focus();
        }}
      />
      
      {/* Date/Time Row */}
      <View style={styles.row}>
        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Date*</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={globalStyles.input}>
            <Text style={styles.pickerText}>{format(date, 'PPP')}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Time*</Text>
          <TouchableOpacity onPress={() => setShowTimePicker(true)} style={globalStyles.input}>
            <Text style={styles.pickerText}>{format(time, 'p')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showDatePicker && (
                <DateTimePicker
                  testID="datePicker"
                  value={date}
                  mode="date"
                  is24Hour={true}
                  display="default"
                  onChange={onDateChange}
                  minimumDate={new Date()}
                />
              )}
  
              {showTimePicker && (
                <DateTimePicker
                  testID="timePicker"
                  value={time}
                  mode="time"
                  is24Hour={true}
                  display="default"
                  onChange={onTimeChange}
                />
              )}

      {/* Duration */}
      <Text style={styles.label}>Duration*</Text>
      <View style={styles.durationContainer}>
        {durations.map(d => (
          <TouchableOpacity
            key={d.value}
            style={[styles.durationChip, duration === d.value && styles.durationChipSelected]}
            onPress={() => setDuration(d.value)}
          >
            <Text style={[styles.durationChipText, duration === d.value && styles.durationChipTextSelected]}>
              {d.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Status (if editing) */}
      {initialData && (
        <>
          <Text style={styles.label}>Status*</Text>
          <View style={styles.durationContainer}>
            {statusOptions.map(s => (
              <TouchableOpacity
                key={s.value}
                style={[styles.durationChip, status === s.value && styles.durationChipSelected]}
                onPress={() => setStatus(s.value)}
              >
                <Text style={[styles.durationChipText, status === s.value && styles.durationChipTextSelected]}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* Delegate Section Header */}
      <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Invite Delegates</Text>
      <View style={styles.headerActions}>
        {users.length > 0 && !loadingUsers && !usersError && (
          <TouchableOpacity 
            onPress={handleAddAllDelegates}
            style={styles.addAllButton}
          >
            <Text style={styles.addAllText}>
              {users.length === invitedDelegates.length ? 'Clear All' : 'Add All'}
            </Text>
          </TouchableOpacity>
        )}
        <Text style={styles.delegateCount}>
          {invitedDelegates.length} selected
        </Text>
      </View>
    </View>
    </View>
  );

  const renderItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={[
        styles.userItem,
        invitedDelegates.includes(item.id) && styles.selectedUser
      ]}
      onPress={() => handleToggleDelegate(item.id)}
      activeOpacity={0.7}
    >
      <Icon
        name={invitedDelegates.includes(item.id) ? 'checkbox-marked' : 'checkbox-blank-outline'}
        size={24}
        color={invitedDelegates.includes(item.id) ? colors.primary : colors.muted}
      />
      <Text style={styles.userName}>{item.fullName}</Text>
      <Text style={styles.userPortfolio}>{item.portfolio}</Text>
    </TouchableOpacity>
  );

  if (!visible) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
        keyboardVerticalOffset={Platform.select({ ios: 60, android: 0 })}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={typography.h2}>
                {initialData ? 'Edit Meeting' : 'Schedule New Meeting'}
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Icon name="close" size={24} color={colors.muted} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={loadingUsers || usersError ? [] : users}
              keyExtractor={item => item.id}
              renderItem={renderItem}
              ListHeaderComponent={renderHeader}
              ListHeaderComponentStyle={styles.listHeader}
              ListFooterComponent={<View style={styles.footerSpacer} />}
              ListEmptyComponent={
                loadingUsers ? (
                  <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />
                ) : usersError ? (
                  <Text style={styles.errorText}>{usersError}</Text>
                ) : null
              }
              contentContainerStyle={styles.listContentContainer}
              keyboardShouldPersistTaps="always" // Changed from "handled" to "always"
              style={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[globalStyles.button, styles.submitButton]}
                onPress={handleSubmit}
                disabled={loadingUsers}
              >
                <Text style={globalStyles.buttonText}>
                  {initialData ? 'Update Meeting' : 'Schedule Meeting'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  safeArea: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: Platform.OS === 'android' ? spacing.xl : 0,
    paddingHorizontal: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xs, 
  },
  headerContainer: {
    paddingBottom: spacing.md,
  },
  listHeader: {
    paddingHorizontal: spacing.md,
  },


  sectionHeader: {
    marginBottom: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: colors.text,
  },

  
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '600',
  },
  spacer: {
    height: spacing.xl, 
  },
  buttonContainer: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  submitButton: {
    width: '100%',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  pickerContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  pickerText: {
    fontSize: 16,
    color: colors.text,
    paddingVertical: (globalStyles.input.height && typeof globalStyles.input.height === 'number' ? 
      (globalStyles.input.height - (16 * 1.5)) / 2 : spacing.sm)
  },
  label: {
    ...typography.body,
    fontWeight: '500',
    marginBottom: spacing.sm,
    color: colors.text,
  },
  durationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  durationChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.secondary,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  durationChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  durationChipText: {
    color: colors.primary,
    fontWeight: '500',
  },
  durationChipTextSelected: {
    color: colors.white,
  },

  section: {
    marginBottom: spacing.xl,
  },

  delegateCount: {
    ...typography.muted,
    color: colors.muted,
  },
  loader: {
    marginVertical: spacing.lg,
  },

  usersFlatList: {
    maxHeight: 250,
  },
  usersList: {
    paddingVertical: spacing.xs,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectedUser: {
    
  },
  
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxIcon: {
    marginRight: spacing.md,
  },
  userTextContainer: {
    flex: 1,
  },
  userName: {
    flex: 1,
    marginLeft: spacing.sm,
    ...typography.body,
  },
  userPortfolio: {
    ...typography.muted,
    marginLeft: spacing.sm,
  },
  selectedUserName: {
    color: colors.primary,
    fontWeight: '500',
  },

  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  errorText: {
    ...typography.muted,
    color: colors.destructive,
    textAlign: 'center',
    marginVertical: spacing.md,
  },
  listContainer: {
    flex: 1,
    width: '100%',
  },
  listContentContainer: {
    paddingBottom: spacing.xl,
  },
 
  formContainer: {
    paddingHorizontal: spacing.md,
  },
  footerSpacer: {
    height: spacing.xl,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  addAllButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.secondary,
    borderRadius: 4,
  },
  addAllText: {
    ...typography.muted,
    color: colors.primary,
    fontWeight: '500',
  },
});