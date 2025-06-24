
// import React, { useState, useEffect } from 'react';
// import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
// import { globalStyles, colors, spacing, typography } from '@/styles/globalStyles';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import type { User, Meeting } from '@/types';
// import { format, parse } from 'date-fns';
// import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

// interface ScheduleMeetingModalProps {
//   visible: boolean;
//   onClose: () => void;
//   onSchedule: (meetingData: Omit<Meeting, 'id' | 'status' | 'meetingLink' | 'attendees'> & { invitedDelegates: string[] }) => Promise<boolean>;
//   initialData?: Partial<Meeting>;
//   allUsers: User[];
// }

// const durations = [
//   { label: '30 minutes', value: 30 },
//   { label: '45 minutes', value: 45 },
//   { label: '1 hour', value: 60 },
//   { label: '1.5 hours', value: 90 },
//   { label: '2 hours', value: 120 },
// ];

// export default function ScheduleMeetingModal({ visible, onClose, onSchedule, initialData, allUsers }: ScheduleMeetingModalProps) {
//   const [title, setTitle] = useState('');
//   const [agenda, setAgenda] = useState('');
//   const [instructions, setInstructions] = useState('');
  
//   const [date, setDate] = useState<Date>(new Date());
//   const [time, setTime] = useState<Date>(new Date()); // Store time as Date object for picker
  
//   const [showDatePicker, setShowDatePicker] = useState(false);
//   const [showTimePicker, setShowTimePicker] = useState(false);

//   const [duration, setDuration] = useState(60);
//   const [selectedDelegates, setSelectedDelegates] = useState<string[]>([]);
//   const [documentReferences, setDocumentReferences] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const activeDelegates = allUsers.filter(u => u.role === 'Delegate' && u.status === 'Active');

//   useEffect(() => {
//     if (visible) {
//       const now = new Date();
//       let initialMeetingDate = initialData?.date ? new Date(initialData.date) : now;
//       let initialMeetingTime = now;
//       if (initialData?.time) {
//         const [hours, minutes] = initialData.time.split(':').map(Number);
//         initialMeetingTime.setHours(hours, minutes);
//       }


//       if (initialData) {
//         setTitle(initialData.title || '');
//         setAgenda(initialData.agenda || '');
//         setInstructions(initialData.instructions || '');
//         setDate(initialMeetingDate);
//         setTime(initialMeetingTime);
//         setDuration(initialData.duration || 60);
//         setSelectedDelegates(initialData.invitedDelegates || []);
//         setDocumentReferences(initialData.documents?.map(d => d.name).join('\n') || '');
//       } else {
//         // Reset form for new meeting
//         setTitle('');
//         setAgenda('');
//         setInstructions('');
//         setDate(now); // Default to today
//         setTime(now); // Default to current time
//         setDuration(60);
//         setSelectedDelegates([]);
//         setDocumentReferences('');
//       }
//     }
//   }, [initialData, visible]);

//   const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
//     setShowDatePicker(Platform.OS === 'ios'); // On iOS, picker can be persistent
//     if (selectedDate) {
//       setDate(selectedDate);
//     }
//   };

//   const onTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
//     setShowTimePicker(Platform.OS === 'ios');
//     if (selectedTime) {
//       setTime(selectedTime);
//     }
//   };

//   const handleDelegateToggle = (delegateId: string) => {
//     setSelectedDelegates(prev =>
//       prev.includes(delegateId) ? prev.filter(id => id !== delegateId) : [...prev, delegateId]
//     );
//   };

//   const handleSubmit = async () => {
//     if (!title || !agenda || !duration) {
//       Alert.alert('Missing Fields', 'Please fill in title, agenda, and duration.');
//       return;
//     }

//     // Combine date and time from state (which are Date objects)
//     const meetingDateTime = new Date(date); // Start with the selected date
//     meetingDateTime.setHours(time.getHours(), time.getMinutes(), 0, 0); // Set hours and minutes from the time state

//     if (isNaN(meetingDateTime.getTime())) {
//         Alert.alert('Invalid Date/Time', 'The selected date or time is invalid.');
//         return;
//     }

//     setIsSubmitting(true);
//     const success = await onSchedule({
//       title,
//       agenda,
//       instructions,
//       date: meetingDateTime, // This is now a full Date object
//       time: format(meetingDateTime, 'HH:mm'), // Format the combined date for storage/display if needed as string
//       duration,
//       invitedDelegates: selectedDelegates,
//       documents: documentReferences.split('\n').filter(name => name.trim() !== '').map(name => ({ name: name.trim(), url: '#' })),
//     });
//     setIsSubmitting(false);
//     if (success) {
//       onClose();
//     }
//   };

//   return (
//     <Modal
//       animationType="slide"
//       transparent={true}
//       visible={visible}
//       onRequestClose={onClose}
//     >
//       <KeyboardAvoidingView
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//         style={styles.modalOverlay}
//       >
//         <View style={styles.modalContent}>
//           <ScrollView
//             showsVerticalScrollIndicator={false}
//             contentContainerStyle={styles.scrollContentContainer}
//           >
//             <View style={styles.header}>
//               <Text style={styles.modalTitle}>{initialData ? 'Edit Meeting' : 'Schedule New Meeting'}</Text>
//               <TouchableOpacity onPress={onClose} style={styles.closeButton}>
//                 <Icon name="close" size={24} color={colors.text} />
//               </TouchableOpacity>
//             </View>

//             <TextInput style={globalStyles.input} placeholder="Meeting Title*" value={title} onChangeText={setTitle} placeholderTextColor={colors.muted}/>
//             <TextInput style={[globalStyles.input, styles.textArea]} placeholder="Agenda*" value={agenda} onChangeText={setAgenda} multiline placeholderTextColor={colors.muted}/>
//             <TextInput style={[globalStyles.input, styles.textArea]} placeholder="Instructions (Optional)" value={instructions} onChangeText={setInstructions} multiline placeholderTextColor={colors.muted}/>
            
//             <View style={styles.row}>
//                 <View style={styles.pickerContainer}>
//                     <Text style={styles.label}>Date*</Text>
//                     <TouchableOpacity onPress={() => setShowDatePicker(true)} style={globalStyles.input}>
//                         <Text style={styles.pickerText}>{format(date, 'PPP')}</Text>
//                     </TouchableOpacity>
//                 </View>
//                  <View style={styles.pickerContainer}>
//                     <Text style={styles.label}>Time*</Text>
//                     <TouchableOpacity onPress={() => setShowTimePicker(true)} style={globalStyles.input}>
//                         <Text style={styles.pickerText}>{format(time, 'p')}</Text>
//                     </TouchableOpacity>
//                 </View>
//             </View>

//             {showDatePicker && (
//               <DateTimePicker
//                 testID="datePicker"
//                 value={date}
//                 mode="date"
//                 is24Hour={true}
//                 display="default"
//                 onChange={onDateChange}
//                 minimumDate={new Date()} // Optional: Prevent selecting past dates
//               />
//             )}

//             {showTimePicker && (
//               <DateTimePicker
//                 testID="timePicker"
//                 value={time}
//                 mode="time"
//                 is24Hour={true} // Use true for 24-hour format, false for AM/PM
//                 display="default"
//                 onChange={onTimeChange}
//               />
//             )}


//             <Text style={styles.label}>Duration*</Text>
//             <View style={styles.durationContainer}>
//               {durations.map(d => (
//                 <TouchableOpacity
//                   key={d.value}
//                   style={[styles.durationChip, duration === d.value && styles.durationChipSelected]}
//                   onPress={() => setDuration(d.value)}
//                 >
//                   <Text style={[styles.durationChipText, duration === d.value && styles.durationChipTextSelected]}>{d.label}</Text>
//                 </TouchableOpacity>
//               ))}
//             </View>

//             <Text style={styles.label}>Invite Delegates (Active)</Text>
//             {activeDelegates.length > 0 ? (
//                 <ScrollView style={styles.delegateContainer} nestedScrollEnabled={true}>
//                     {activeDelegates.map(delegate => (
//                     <TouchableOpacity key={delegate.id} style={styles.delegateItem} onPress={() => handleDelegateToggle(delegate.id)}>
//                         <Icon name={selectedDelegates.includes(delegate.id) ? "checkbox-marked-outline" : "checkbox-blank-outline"} size={20} color={colors.primary} />
//                         <Text style={styles.delegateName}>{delegate.fullName} ({delegate.portfolio})</Text>
//                     </TouchableOpacity>
//                     ))}
//                 </ScrollView>
//             ) : (
//                 <Text style={typography.muted}>No active delegates available.</Text>
//             )}

//             <TextInput style={[globalStyles.input, styles.textArea]} placeholder="Document References (Optional, one per line)" value={documentReferences} onChangeText={setDocumentReferences} multiline placeholderTextColor={colors.muted}/>

//           </ScrollView>
//           <View style={styles.footer}>
//             <TouchableOpacity
//                 style={[globalStyles.button, globalStyles.buttonOutline, styles.actionButton, {marginRight: spacing.sm}]}
//                 onPress={onClose} disabled={isSubmitting}>
//                 <Text style={[globalStyles.buttonText, globalStyles.buttonOutlineText]}>Cancel</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//                 style={[globalStyles.button, styles.actionButton, isSubmitting && globalStyles.buttonDisabled]}
//                 onPress={handleSubmit} disabled={isSubmitting}>
//                 {isSubmitting ? (
//                     <Text style={globalStyles.buttonText}>Saving...</Text>
//                 ) : (
//                     <Text style={globalStyles.buttonText}>{initialData ? 'Save Changes' : 'Schedule Meeting'}</Text>
//                 )}
//             </TouchableOpacity>
//           </View>
//         </View>
//       </KeyboardAvoidingView>
//     </Modal>
//   );
// }

// const styles = StyleSheet.create({
//   modalOverlay: {
//     flex: 1,
//     justifyContent: 'flex-end',
//     backgroundColor: 'rgba(0,0,0,0.5)',
//   },
//   modalContent: {
//     backgroundColor: colors.background,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     paddingHorizontal: spacing.lg,
//     paddingTop: spacing.lg,
//     paddingBottom: spacing.sm,
//     maxHeight: '85%',
//   },
//   scrollContentContainer: {
//     paddingBottom: spacing.lg, // Increased padding to ensure last element scrolls above footer
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: spacing.lg,
//   },
//   modalTitle: {
//     ...typography.h2,
//   },
//   closeButton: {
//     padding: spacing.sm,
//   },
//   textArea: {
//     minHeight: 80,
//     textAlignVertical: 'top',
//     marginBottom: spacing.md, // Ensure consistent margin
//   },
//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: spacing.md,
//   },
//   pickerContainer: {
//       flex: 1, // Each picker container takes half the width
//       marginRight: spacing.sm, // Add some space between date and time pickers
//   },
//   // halfInput: { // No longer strictly needed if picker controls have their own styling
//   //   width: '48%',
//   // },
//   pickerText: { // Style for the text inside TouchableOpacity for pickers
//     fontSize: 16,
//     color: colors.text,
//     paddingVertical: (globalStyles.input.height - (16 * 1.5))/2 // Approximate vertical centering
//   },
//   label: {
//     ...typography.body,
//     fontWeight: '500',
//     // marginTop: spacing.md, // Removed, as pickerContainer or input itself has margin
//     marginBottom: spacing.sm,
//     color: colors.text,
//   },
//   durationContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: spacing.sm,
//     marginBottom: spacing.md,
//   },
//   durationChip: {
//     paddingVertical: spacing.sm,
//     paddingHorizontal: spacing.md,
//     backgroundColor: colors.secondary,
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: colors.border,
//   },
//   durationChipSelected: {
//     backgroundColor: colors.primary,
//     borderColor: colors.primary,
//   },
//   durationChipText: {
//     color: colors.primary,
//     fontWeight: '500',
//   },
//   durationChipTextSelected: {
//     color: colors.white,
//   },
//   delegateContainer: {
//     maxHeight: 150,
//     marginBottom: spacing.md,
//     borderColor: colors.border, // Add border for clarity
//     borderWidth: 1,
//     borderRadius: 8,
//     paddingHorizontal: spacing.sm,
//   },
//   delegateItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: spacing.sm,
//   },
//   delegateName: {
//     ...typography.body,
//     marginLeft: spacing.sm,
//     color: colors.text,
//   },
//   footer: {
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//     paddingTop: spacing.md,
//     borderTopWidth: StyleSheet.hairlineWidth,
//     borderTopColor: colors.border,
//   },
//   actionButton: {
//     flex: 1,
//     maxWidth: '48%',
//   }
// });



import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { globalStyles, colors, spacing, typography } from '@/styles/globalStyles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { User, Meeting } from '@/types';
import { format, parse } from 'date-fns';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useAuth } from '@/context/AuthContext'; // Import useAuth

interface ScheduleMeetingModalProps {
  visible: boolean;
  onClose: () => void;
  onSchedule: (meetingData: Omit<Meeting, 'id' | 'status' | 'meetingLink' | 'attendees'> & { invitedDelegates: string[] }) => Promise<boolean>;
  initialData?: Partial<Meeting>;
  // allUsers prop is removed, will fetch from context
}

const durations = [
  { label: '30 minutes', value: 30 },
  { label: '45 minutes', value: 45 },
  { label: '1 hour', value: 60 },
  { label: '1.5 hours', value: 90 },
  { label: '2 hours', value: 120 },
];

export default function ScheduleMeetingModal({ visible, onClose, onSchedule, initialData }: ScheduleMeetingModalProps) {
  const { fetchUsers } = useAuth(); // Get fetchUsers from context
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [title, setTitle] = useState('');
  const [agenda, setAgenda] = useState('');
  const [instructions, setInstructions] = useState('');
  
  const [date, setDate] = useState<Date>(new Date());
  const [time, setTime] = useState<Date>(new Date());
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [duration, setDuration] = useState(60);
  const [selectedDelegates, setSelectedDelegates] = useState<string[]>([]);
  const [documentReferences, setDocumentReferences] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
        const loadUsersForModal = async () => {
            setLoadingUsers(true);
            try {
                const users = await fetchUsers();
                setAllUsers(users);
            } catch (err) {
                console.error("Failed to fetch users for modal:", err);
                Alert.alert("Error", "Could not load user list for invitations.");
            } finally {
                setLoadingUsers(false);
            }
        };
        loadUsersForModal();

      const now = new Date();
      let initialMeetingDate = initialData?.date ? new Date(initialData.date) : now;
      let initialMeetingTime = now;

      if (initialData?.time) {
        try {
            const parsedTime = parse(initialData.time, 'HH:mm', new Date());
            if (!isNaN(parsedTime.getTime())) {
                 initialMeetingTime = parsedTime;
            } else {
                console.warn("Invalid initialData.time format, defaulting to now:", initialData.time);
            }
        } catch (e) {
             console.warn("Error parsing initialData.time, defaulting to now:", initialData.time, e);
        }
      }


      if (initialData) {
        setTitle(initialData.title || '');
        setAgenda(initialData.agenda || '');
        setInstructions(initialData.instructions || '');
        setDate(initialMeetingDate);
        setTime(initialMeetingTime);
        setDuration(initialData.duration || 60);
        setSelectedDelegates(initialData.invitedDelegates || []);
        setDocumentReferences(initialData.documents?.map(d => d.name).join('\n') || '');
      } else {
        setTitle('');
        setAgenda('');
        setInstructions('');
        setDate(now);
        setTime(now);
        setDuration(60);
        setSelectedDelegates([]);
        setDocumentReferences('');
      }
    }
  }, [initialData, visible, fetchUsers]);

  const activeDelegates = allUsers.filter(u => u.role === 'Delegate' && u.status === 'Active');

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

  const handleDelegateToggle = (delegateId: string) => {
    setSelectedDelegates(prev =>
      prev.includes(delegateId) ? prev.filter(id => id !== delegateId) : [...prev, delegateId]
    );
  };

  const handleSubmit = async () => {
    if (!title || !agenda || !duration) {
      Alert.alert('Missing Fields', 'Please fill in title, agenda, and duration.');
      return;
    }

    const meetingDateTime = new Date(date);
    meetingDateTime.setHours(time.getHours(), time.getMinutes(), 0, 0);

    if (isNaN(meetingDateTime.getTime())) {
        Alert.alert('Invalid Date/Time', 'The selected date or time is invalid.');
        return;
    }

    setIsSubmitting(true);
    const success = await onSchedule({
      title,
      agenda,
      instructions,
      date: meetingDateTime,
      time: format(meetingDateTime, 'HH:mm'),
      duration,
      invitedDelegates: selectedDelegates,
      documents: documentReferences.split('\n').filter(name => name.trim() !== '').map(name => ({ name: name.trim(), url: '#' })), // Placeholder URL
    });
    setIsSubmitting(false);
    if (success) {
      onClose();
    }
  };

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
      >
        <View style={styles.modalContent}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContentContainer}
          >
            <View style={styles.header}>
              <Text style={styles.modalTitle}>{initialData ? 'Edit Meeting' : 'Schedule New Meeting'}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Icon name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <TextInput style={globalStyles.input} placeholder="Meeting Title*" value={title} onChangeText={setTitle} placeholderTextColor={colors.muted}/>
            <TextInput style={[globalStyles.input, styles.textArea]} placeholder="Agenda*" value={agenda} onChangeText={setAgenda} multiline placeholderTextColor={colors.muted}/>
            <TextInput style={[globalStyles.input, styles.textArea]} placeholder="Instructions (Optional)" value={instructions} onChangeText={setInstructions} multiline placeholderTextColor={colors.muted}/>
            
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


            <Text style={styles.label}>Duration*</Text>
            <View style={styles.durationContainer}>
              {durations.map(d => (
                <TouchableOpacity
                  key={d.value}
                  style={[styles.durationChip, duration === d.value && styles.durationChipSelected]}
                  onPress={() => setDuration(d.value)}
                >
                  <Text style={[styles.durationChipText, duration === d.value && styles.durationChipTextSelected]}>{d.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Invite Delegates (Active)</Text>
            {loadingUsers ? <ActivityIndicator color={colors.primary} /> : 
             activeDelegates.length > 0 ? (
                <ScrollView style={styles.delegateContainer} nestedScrollEnabled={true}>
                    {activeDelegates.map(delegate => (
                    <TouchableOpacity key={delegate.id} style={styles.delegateItem} onPress={() => handleDelegateToggle(delegate.id)}>
                        <Icon name={selectedDelegates.includes(delegate.id) ? "checkbox-marked-outline" : "checkbox-blank-outline"} size={20} color={colors.primary} />
                        <Text style={styles.delegateName}>{delegate.fullName} ({delegate.portfolio})</Text>
                    </TouchableOpacity>
                    ))}
                </ScrollView>
            ) : (
                <Text style={typography.muted}>No active delegates found or an error occurred.</Text>
            )}

            <TextInput style={[globalStyles.input, styles.textArea]} placeholder="Document References (Optional, one per line)" value={documentReferences} onChangeText={setDocumentReferences} multiline placeholderTextColor={colors.muted}/>

          </ScrollView>
          <View style={styles.footer}>
            <TouchableOpacity
                style={[globalStyles.button, globalStyles.buttonOutline, styles.actionButton, {marginRight: spacing.sm}]}
                onPress={onClose} disabled={isSubmitting}>
                <Text style={[globalStyles.buttonText, globalStyles.buttonOutlineText]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[globalStyles.button, styles.actionButton, isSubmitting && globalStyles.buttonDisabled]}
                onPress={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                    <ActivityIndicator color={colors.white} />
                ) : (
                    <Text style={globalStyles.buttonText}>{initialData ? 'Save Changes' : 'Schedule Meeting'}</Text>
                )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    maxHeight: '85%',
  },
  scrollContentContainer: {
    paddingBottom: spacing.xl, // Increased padding
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    ...typography.h2,
  },
  closeButton: {
    padding: spacing.sm,
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
    // Adjust padding if globalStyles.input height implies it
    paddingVertical: (globalStyles.input.height && typeof globalStyles.input.height === 'number' ? (globalStyles.input.height - (16 * 1.5)) / 2 : spacing.sm)
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
  delegateContainer: {
    maxHeight: 150, // Limit height
    marginBottom: spacing.md,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.sm, // Add padding inside the scrollview border
  },
  delegateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  delegateName: {
    ...typography.body,
    marginLeft: spacing.sm,
    color: colors.text,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  actionButton: {
    flex: 1,
    maxWidth: '48%',
  }
});
