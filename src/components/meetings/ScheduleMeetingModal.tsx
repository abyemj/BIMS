
// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Modal,
//   KeyboardAvoidingView,
//   Platform,
//   Alert,
//   ActivityIndicator,
//   SafeAreaView
// } from 'react-native';
// import { useAuth } from '@/context/AuthContext';
// import { globalStyles, colors, spacing, typography } from '@/styles/globalStyles';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import { databases } from '@/lib/appwrite';
// import type { User, Meeting } from '@/types';
// import { Query } from 'appwrite';
// import { format } from 'date-fns';
// import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
// import { storage , client} from '@/lib/appwrite'; // Add this import
// import * as DocumentPicker from 'expo-document-picker'; // Install expo-document-picker
// import * as FileSystem from 'expo-file-system'; // Install expo-file-syste
// import type { MeetingDocument } from '@/types'; // Adjust path as needed
// import { DocumentPickerResult,DocumentPickerOptions } from 'expo-document-picker';

// interface ScheduleMeetingModalProps {
//   visible: boolean;
//   onClose: () => void;
//   onSchedule: (meetingData: any) => Promise<boolean>;
//   initialData?: Meeting;
// }

// const durations = [
//   { label: '30 minutes', value: 30 },
//   { label: '45 minutes', value: 45 },
//   { label: '1 hour', value: 60 },
//   { label: '1.5 hours', value: 90 },
//   { label: '2 hours', value: 120 },
// ];

// const statusOptions: { label: string; value: Meeting['status'] }[] = [
//   { label: 'Scheduled', value: 'Scheduled' },
//   { label: 'Ongoing', value: 'Ongoing' },
//   { label: 'Completed', value: 'Completed' },
//   { label: 'Archived', value: 'Archived' },
// ];

// export default function ScheduleMeetingModal({ visible, onClose, onSchedule, initialData }: ScheduleMeetingModalProps) {
//   const { user } = useAuth();
//   const [title, setTitle] = useState(initialData?.title || '');
//   const [date, setDate] = useState<Date>(initialData?.date ? new Date(initialData.date) : new Date());
//   const [time, setTime] = useState<Date>(initialData?.time ? new Date(initialData.time) : new Date());
//   const [duration, setDuration] = useState(initialData?.duration || 60);
//   const [agenda, setAgenda] = useState(initialData?.agenda || '');
//   const [instructions, setInstructions] = useState(initialData?.instructions || '');
//   const [status, setStatus] = useState<Meeting['status']>(initialData?.status || 'Scheduled');
//   const [invitedDelegates, setInvitedDelegates] = useState<string[]>(initialData?.invitedDelegates || []);
//   const [users, setUsers] = useState<User[]>([]);
//   const [loadingUsers, setLoadingUsers] = useState(true);
//   const [usersError, setUsersError] = useState<string | null>(null);
//   const [showDatePicker, setShowDatePicker] = useState(false);
//   const [showTimePicker, setShowTimePicker] = useState(false);
//   const [documents, setDocuments] = useState<MeetingDocument[]>(initialData?.documents || []);
//   const [isUploading, setIsUploading] = useState(false);
  

//   useEffect(() => {
//     const fetchUsers = async () => {
//       if (!user?.tenant) return;
      
//       try {
//         setLoadingUsers(true);
//         setUsersError(null);
        
//         const response = await databases.listDocuments(
//           '6848228c00222dfaf82e',
//           '68597845003de1b5dcc0',
//           [
//             Query.equal('tenant', user.tenant),
//             Query.equal('status', 'Active'),
//             Query.equal('role', 'Delegate')
//           ]
//         );
  
//         // Map to User type with consistent ID handling
//         const delegateUsers = response.documents.map(doc => ({
//           id: doc.$id, // Using database document ID
//           authId: doc.authId || doc.$id, // Include auth ID if available
//           fullName: doc.name,
//           email: doc.email,
//           phone: doc.phone,
//           role: doc.role,
//           portfolio: doc.portfolio,
//           status: doc.status,
//           tenant: doc.tenant
//         }));
  
//         setUsers(delegateUsers);
//       } catch (error) {
//         console.error('Failed to fetch users:', error);
//         setUsersError('Could not load users. Please try again.');
//       } finally {
//         setLoadingUsers(false);
//       }
//     };
  
//     if (visible) {
//       fetchUsers();
//     }
//   }, [visible, user?.tenant]);

//   const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
//     setShowDatePicker(Platform.OS === 'ios');
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

//   const handleToggleDelegate = (userId: string) => {
//     setInvitedDelegates(prev =>
//       prev.includes(userId)
//         ? prev.filter(id => id !== userId)
//         : [...prev, userId]
//     );
//   };


//   const handleAddAllDelegates = () => {
//     // Create a Set for faster lookups
//     const currentSelected = new Set(invitedDelegates);
//     const allUserIds = users.map(user => user.id);
    
//     // If some are already selected, deselect all
//     if (users.length === invitedDelegates.length) {
//       setInvitedDelegates([]);
//     } else {
//       // Select all (including any previously selected)
//       setInvitedDelegates([...new Set([...invitedDelegates, ...allUserIds])]);
//     }
//   };

//   const handleDocumentPick = async () => {
//     try {
//       const result = await DocumentPicker.getDocumentAsync({
//         type: '*/*',
//         copyToCacheDirectory: true,
//       } as DocumentPickerOptions);
  
//       if (result.type === 'success') {
//         setIsUploading(true);
        
//         // Type guard for successful pick
//         const successResult = result as DocumentPickerResult & { 
//           type: 'success';
//           uri: string;
//           name: string;
//           mimeType: string | null;
//         };
  
//         // Get file info
//         const fileInfo = await FileSystem.getInfoAsync(successResult.uri);
//         if (!fileInfo.exists) {
//           throw new Error('File not found');
//         }
  
//         // Check file size (10MB limit)
//         const MAX_SIZE = 10 * 1024 * 1024;
//         if (fileInfo.size && fileInfo.size > MAX_SIZE) {
//           Alert.alert('Error', 'File size exceeds 10MB limit');
//           return;
//         }
  
//         // Read file content
//         const fileContent = await FileSystem.readAsStringAsync(
//           successResult.uri, 
//           { encoding: FileSystem.EncodingType.Base64 }
//         );
  
//         // Create blob (alternative approach)
//         const byteCharacters = atob(fileContent);
//         const byteNumbers = new Array(byteCharacters.length);
//         for (let i = 0; i < byteCharacters.length; i++) {
//           byteNumbers[i] = byteCharacters.charCodeAt(i);
//         }
//         const byteArray = new Uint8Array(byteNumbers);
//         const blob = new Blob([byteArray], { 
//           type: successResult.mimeType || 'application/octet-stream' 
//         });
  
//         // Upload to Appwrite storage
//         const file = await storage.createFile(
//           '685f599b0034c8890ccd', 
//           'unique()',
//           blob
//         );
  
//         // Add to documents state
//         setDocuments(prev => [
//           ...prev,
//           {
//             name: successResult.name,
//             url: `${client.config.endpoint}/storage/buckets/YOUR_BUCKET_ID/files/${file.$id}/view`,
//             type: successResult.mimeType || 'unknown',
//             size: fileInfo.size,
//             fileId: file.$id
//           }
//         ]);
//       }
//     } catch (error) {
//       console.error('Document upload error:', error);
//       Alert.alert('Error', 'Failed to upload document');
//     } finally {
//       setIsUploading(false);
//     }
//   };


//   const handleRemoveDocument = (index: number) => {
//     setDocuments(prev => prev.filter((_, i) => i !== index));
//   };
  
 

//   const handleSubmit = async () => {
//     if (!title || !agenda) {
//       Alert.alert('Required fields', 'Please fill in all required fields');
//       return;
//     }
  
//     // Combine date and time into a single Date object
//     const meetingDateTime = new Date(
//       date.getFullYear(),
//       date.getMonth(),
//       date.getDate(),
//       time.getHours(),
//       time.getMinutes()
//     );
  
//     const meetingData = {
//       title,
//       date: meetingDateTime, // Now using combined datetime
//       duration,
//       agenda,
//       instructions,
//       meetingLink: '', // Will be set by handleScheduleMeeting
//       invitedDelegates,
//       documents,
//       tenant: user?.tenant,
//     };
  
//     try {
//       const success = await onSchedule(meetingData);
//       if (success) {
//         onClose();
//       }
//     } catch (error) {
//       console.error("Error scheduling meeting:", error);
//       Alert.alert('Error', 'Could not schedule the meeting. Please try again.');
//     }
//   };


  

//   const renderHeader = () => (
//     <View style={styles.headerContainer}>
//       {/* Meeting Title */}
//       <TextInput
//         style={globalStyles.input}
//         placeholder="Meeting Title*"
//         value={title}
//         onChangeText={setTitle}
//         placeholderTextColor={colors.muted}
//         // blurOnSubmit={false} // Prevent keyboard from dismissing
//         returnKeyType="next" // Show "next" button
//         onSubmitEditing={() => {
//           // Optionally focus next field
//           // agendaInputRef.current?.focus();
//         }}
//       />
      
//       {/* Agenda */}
//       <TextInput 
//         style={globalStyles.input} 
//         placeholder="Agenda*" 
//         value={agenda} 
//         onChangeText={setAgenda} 
//         multiline 
//         placeholderTextColor={colors.muted}
//         blurOnSubmit={false}
//         returnKeyType="next"
//         onSubmitEditing={() => {
//           // Optionally focus next field
//           // agendaInputRef.current?.focus();
//         }}
//       />
      
//       {/* Instructions */}
//       <TextInput 
//         style={globalStyles.input} 
//         placeholder="Instructions (Optional)" 
//         value={instructions} 
//         onChangeText={setInstructions} 
//         multiline 
//         placeholderTextColor={colors.muted}
//         blurOnSubmit={false}
//         returnKeyType="next"
//         onSubmitEditing={() => {
//           // Optionally focus next field
//           // agendaInputRef.current?.focus();
//         }}
//       />
      
//       {/* Date/Time Row */}
//       <View style={styles.row}>
//         <View style={styles.pickerContainer}>
//           <Text style={styles.label}>Date*</Text>
//           <TouchableOpacity onPress={() => setShowDatePicker(true)} style={globalStyles.input}>
//             <Text style={styles.pickerText}>{format(date, 'PPP')}</Text>
//           </TouchableOpacity>
//         </View>
//         <View style={styles.pickerContainer}>
//           <Text style={styles.label}>Time*</Text>
//           <TouchableOpacity onPress={() => setShowTimePicker(true)} style={globalStyles.input}>
//             <Text style={styles.pickerText}>{format(time, 'p')}</Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       {showDatePicker && (
//                 <DateTimePicker
//                   testID="datePicker"
//                   value={date}
//                   mode="date"
//                   is24Hour={true}
//                   display="default"
//                   onChange={onDateChange}
//                   minimumDate={new Date()}
//                 />
//               )}
  
//               {showTimePicker && (
//                 <DateTimePicker
//                   testID="timePicker"
//                   value={time}
//                   mode="time"
//                   is24Hour={true}
//                   display="default"
//                   onChange={onTimeChange}
//                 />
//               )}

//       {/* Duration */}
//       <Text style={styles.label}>Duration*</Text>
//       <View style={styles.durationContainer}>
//         {durations.map(d => (
//           <TouchableOpacity
//             key={d.value}
//             style={[styles.durationChip, duration === d.value && styles.durationChipSelected]}
//             onPress={() => setDuration(d.value)}
//           >
//             <Text style={[styles.durationChipText, duration === d.value && styles.durationChipTextSelected]}>
//               {d.label}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {/* Status (if editing) */}
//       {initialData && (
//         <>
//           <Text style={styles.label}>Status*</Text>
//           <View style={styles.durationContainer}>
//             {statusOptions.map(s => (
//               <TouchableOpacity
//                 key={s.value}
//                 style={[styles.durationChip, status === s.value && styles.durationChipSelected]}
//                 onPress={() => setStatus(s.value)}
//               >
//                 <Text style={[styles.durationChipText, status === s.value && styles.durationChipTextSelected]}>
//                   {s.label}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         </>
//       )}

// <View style={styles.section}>
//   <Text style={styles.sectionTitle}>Meeting Documents</Text>
  
//   {documents.length > 0 && (
//     <View style={styles.documentsContainer}>
//       {documents.map((doc, index) => (
//         <View key={index} style={styles.documentItem}>
//           <Icon name="file-document-outline" size={20} color={colors.primary} />
//           <Text style={styles.documentName} numberOfLines={1}>
//             {doc.name}
//           </Text>
//           <TouchableOpacity onPress={() => handleRemoveDocument(index)}>
//             <Icon name="close" size={16} color={colors.destructive} />
//           </TouchableOpacity>
//         </View>
//       ))}
//     </View>
//   )}

//   <TouchableOpacity 
//     style={[globalStyles.button, globalStyles.buttonOutline, styles.addDocumentButton]}
//     onPress={handleDocumentPick}
//     disabled={isUploading}
//   >
//     {isUploading ? (
//       <ActivityIndicator size="small" color={colors.primary} />
//     ) : (
//       <>
//         <Icon name="plus" size={16} color={colors.primary} />
//         <Text style={[globalStyles.buttonText, globalStyles.buttonOutlineText]}>
//           Add Document
//         </Text>
//       </>
//     )}
//   </TouchableOpacity>
// </View>

//       {/* Delegate Section Header */}
//       <View style={styles.sectionHeader}>
//       <Text style={styles.sectionTitle}>Invite Delegates</Text>
//       <View style={styles.headerActions}>
//         {users.length > 0 && !loadingUsers && !usersError && (
//           <TouchableOpacity 
//             onPress={handleAddAllDelegates}
//             style={styles.addAllButton}
//           >
//             <Text style={styles.addAllText}>
//               {users.length === invitedDelegates.length ? 'Clear All' : 'Add All'}
//             </Text>
//           </TouchableOpacity>
//         )}
//         <Text style={styles.delegateCount}>
//           {invitedDelegates.length} selected
//         </Text>
//       </View>
//     </View>
//     </View>
//   );

//   const renderItem = ({ item }: { item: User }) => (
//     <TouchableOpacity
//       style={[
//         styles.userItem,
//         invitedDelegates.includes(item.id) && styles.selectedUser
//       ]}
//       onPress={() => handleToggleDelegate(item.id)}
//       activeOpacity={0.7}
//     >
//       <Icon
//         name={invitedDelegates.includes(item.id) ? 'checkbox-marked' : 'checkbox-blank-outline'}
//         size={24}
//         color={invitedDelegates.includes(item.id) ? colors.primary : colors.muted}
//       />
//       <Text style={styles.userName}>{item.fullName}</Text>
//       <Text style={styles.userPortfolio}>{item.portfolio}</Text>
//     </TouchableOpacity>
//   );

//   if (!visible) return null;

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
//         keyboardVerticalOffset={Platform.select({ ios: 60, android: 0 })}
//       >
//         <SafeAreaView style={styles.safeArea}>
//           <View style={styles.modalContainer}>
//             <View style={styles.modalHeader}>
//               <Text style={typography.h2}>
//                 {initialData ? 'Edit Meeting' : 'Schedule New Meeting'}
//               </Text>
//               <TouchableOpacity onPress={onClose}>
//                 <Icon name="close" size={24} color={colors.muted} />
//               </TouchableOpacity>
//             </View>

//             <FlatList
//               data={loadingUsers || usersError ? [] : users}
//               keyExtractor={item => item.id}
//               renderItem={renderItem}
//               ListHeaderComponent={renderHeader}
//               ListHeaderComponentStyle={styles.listHeader}
//               ListFooterComponent={<View style={styles.footerSpacer} />}
//               ListEmptyComponent={
//                 loadingUsers ? (
//                   <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />
//                 ) : usersError ? (
//                   <Text style={styles.errorText}>{usersError}</Text>
//                 ) : null
//               }
//               contentContainerStyle={styles.listContentContainer}
//               keyboardShouldPersistTaps="always" // Changed from "handled" to "always"
//               style={styles.listContainer}
//               showsVerticalScrollIndicator={false}
//             />

//             <View style={styles.buttonContainer}>
//               <TouchableOpacity
//                 style={[globalStyles.button, styles.submitButton]}
//                 onPress={handleSubmit}
//                 disabled={loadingUsers}
//               >
//                 <Text style={globalStyles.buttonText}>
//                   {initialData ? 'Update Meeting' : 'Schedule Meeting'}
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </SafeAreaView>
//       </KeyboardAvoidingView>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//   },
//   safeArea: {
//     flex: 1,
//   },
//   modalContainer: {
//     flex: 1,
//     backgroundColor: colors.background,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     marginTop: Platform.OS === 'android' ? spacing.xl : 0,
//     paddingHorizontal: spacing.lg,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: spacing.lg,
//   },
//   scrollView: {
//     flex: 1,
//   },
//   scrollContent: {
//     paddingBottom: spacing.xs, 
//   },
//   headerContainer: {
//     paddingBottom: spacing.md,
//   },
//   listHeader: {
//     paddingHorizontal: spacing.md,
//   },


//   sectionHeader: {
//     marginBottom: spacing.lg,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     color: colors.text,
//   },

  
//   sectionTitle: {
//     ...typography.h3,
//     color: colors.text,
//     fontWeight: '600',
//   },
//   spacer: {
//     height: spacing.xl, 
//   },
//   buttonContainer: {
//     paddingVertical: spacing.md,
//     paddingHorizontal: spacing.lg,
//     backgroundColor: colors.background,
//     borderTopWidth: 1,
//     borderTopColor: colors.border,
//   },
//   submitButton: {
//     width: '100%',
//   },
//   textArea: {
//     minHeight: 80,
//     textAlignVertical: 'top',
//     marginBottom: spacing.md,
//   },
//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: spacing.md,
//   },
//   pickerContainer: {
//     flex: 1,
//     marginRight: spacing.sm,
//   },
//   pickerText: {
//     fontSize: 16,
//     color: colors.text,
//     paddingVertical: (globalStyles.input.height && typeof globalStyles.input.height === 'number' ? 
//       (globalStyles.input.height - (16 * 1.5)) / 2 : spacing.sm)
//   },
//   label: {
//     ...typography.body,
//     fontWeight: '500',
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

//   section: {
//     marginBottom: spacing.xl,
//   },

//   delegateCount: {
//     ...typography.muted,
//     color: colors.muted,
//   },
//   loader: {
//     marginVertical: spacing.lg,
//   },

//   usersFlatList: {
//     maxHeight: 250,
//   },
//   usersList: {
//     paddingVertical: spacing.xs,
//   },
//   userItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: spacing.lg,
//     borderBottomWidth: 1,
//     borderBottomColor: colors.border,
//   },
//   selectedUser: {
    
//   },
  
//   userInfoContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   checkboxIcon: {
//     marginRight: spacing.md,
//   },
//   userTextContainer: {
//     flex: 1,
//   },
//   userName: {
//     flex: 1,
//     marginLeft: spacing.sm,
//     ...typography.body,
//   },
//   userPortfolio: {
//     ...typography.muted,
//     marginLeft: spacing.sm,
//   },
//   selectedUserName: {
//     color: colors.primary,
//     fontWeight: '500',
//   },

//   separator: {
//     height: 1,
//     backgroundColor: colors.border,
//     marginHorizontal: spacing.md,
//   },
//   errorText: {
//     ...typography.muted,
//     color: colors.destructive,
//     textAlign: 'center',
//     marginVertical: spacing.md,
//   },
//   listContainer: {
//     flex: 1,
//     width: '100%',
//   },
//   listContentContainer: {
//     paddingBottom: spacing.xl,
//   },
 
//   formContainer: {
//     paddingHorizontal: spacing.md,
//   },
//   footerSpacer: {
//     height: spacing.xl,
//   },
//   headerActions: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: spacing.sm,
//   },
//   addAllButton: {
//     paddingVertical: spacing.xs,
//     paddingHorizontal: spacing.sm,
//     backgroundColor: colors.secondary,
//     borderRadius: 4,
//   },
//   addAllText: {
//     ...typography.muted,
//     color: colors.primary,
//     fontWeight: '500',
//   },
//   documentsContainer: {
//     marginBottom: spacing.md,
//   },
//   documentItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: spacing.sm,
//     backgroundColor: colors.card,
//     borderRadius: 8,
//     marginBottom: spacing.xs,
//   },
//   documentName: {
//     flex: 1,
//     marginLeft: spacing.sm,
//     marginRight: spacing.sm,
//     ...typography.body,
//   },
//   addDocumentButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: spacing.sm,
//   },
// });




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
import { databases, storage, client } from '@/lib/appwrite'; // FIX: Added InputFile
import type { User, Meeting, MeetingDocument } from '@/types';
import { Query } from 'appwrite';
import { format } from 'date-fns';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';

interface ScheduleMeetingModalProps {
  visible: boolean;
  onClose: () => void;
  onSchedule: (meetingData: any) => Promise<boolean>;
  initialData?: Meeting;
}

const durations = [
  // ... (your durations array)
  { label: '30 minutes', value: 30 },
  { label: '45 minutes', value: 45 },
  { label: '1 hour', value: 60 },
  { label: '1.5 hours', value: 90 },
  { label: '2 hours', value: 120 },
];

const statusOptions: { label: string; value: Meeting['status'] }[] = [
  // ... (your statusOptions array)
  { label: 'Scheduled', value: 'Scheduled' },
  { label: 'Ongoing', value: 'Ongoing' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Archived', value: 'Archived' },
];

export default function ScheduleMeetingModal({ visible, onClose, onSchedule, initialData }: ScheduleMeetingModalProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState(initialData?.title || '');
  const [date, setDate] = useState<Date>(initialData?.date ? new Date(initialData.date) : new Date());
  const [time, setTime] = useState<Date>(initialData?.date ? new Date(initialData.date) : new Date());
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
  const [documents, setDocuments] = useState<MeetingDocument[]>(initialData?.documents || []);
  const [isUploading, setIsUploading] = useState(false);

  // ... (useEffect for fetching users remains the same)
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
  
        const delegateUsers = response.documents.map(doc => ({
          id: doc.$id,
          authId: doc.authId || doc.$id,
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


  // ... (onDateChange, onTimeChange, handleToggleDelegate remain the same)
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
    const allUserIds = users.map(user => user.id);
    if (users.length === invitedDelegates.length) {
      setInvitedDelegates([]);
    } else {
      setInvitedDelegates(allUserIds);
    }
  };

  // --- START OF CORRECTED CODE ---
  const handleDocumentPick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: false,
      });
  
      if (result.assets && result.assets.length > 0) {
        setIsUploading(true);
        
        const asset = result.assets[0];
  
        // File size check (this is still good practice)
        const MAX_SIZE = 10 * 1024 * 1024;
        if (asset.size && asset.size > MAX_SIZE) {
          Alert.alert('Error', `File size exceeds 10MB limit. Max size is 10MB, your file is ${(asset.size / 1024 / 1024).toFixed(2)}MB.`);
          setIsUploading(false);
          return;
        }
  
        // --- FIX: Create a 'File-like' object for Appwrite SDK v5 ---
        // This is the correct method for older SDK versions in React Native.
        const fileObject = {
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType || 'application/octet-stream', // Provide a fallback MIME type
          size: asset.size,
        };
  
        const file = await storage.createFile(
          '685f599b0034c8890ccd', // Your Bucket ID
          'unique()',
          // Pass the file-like object and cast to `any` to satisfy TypeScript
          fileObject as any 
        );
  
        // The rest of your logic is correct
        setDocuments(prev => [
          ...prev,
          {
            name: asset.name,
            url: `${client.config.endpoint}/storage/buckets/${file.bucketId}/files/${file.$id}/view`,
            type: asset.mimeType || 'unknown',
            size: asset.size,
            fileId: file.$id
          }
        ]);
      }
    } catch (error) {
      console.error('Document upload error:', error);
      Alert.alert('Error', 'Failed to upload document. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
  // --- END OF CORRECTED CODE ---


  const handleRemoveDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async () => {
    if (!title || !agenda) {
      Alert.alert('Required fields', 'Please fill in all required fields');
      return;
    }
  
    const meetingDateTime = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      time.getHours(),
      time.getMinutes()
    );
  
    // Important: Only send the necessary data to the backend
    const documentsToSave = documents.map(doc => ({
      name: doc.name,
      fileId: doc.fileId,
      type: doc.type,
      size: doc.size,
    }));
  
    const meetingData = {
      title,
      date: meetingDateTime.toISOString(), // Send as ISO string
      duration,
      agenda,
      instructions,
      invitedDelegates,
      documents: documentsToSave, // Send cleaned document data
      tenant: user?.tenant,
      status: status, // Make sure status is included
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
  
  // ... (renderHeader, renderItem, and JSX return remain the same)
  // ... (styles remain the same)
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Meeting Title */}
      <TextInput
        style={globalStyles.input}
        placeholder="Meeting Title*"
        value={title}
        onChangeText={setTitle}
        placeholderTextColor={colors.muted}
        returnKeyType="next"
      />
      
      {/* Agenda */}
      <TextInput 
        style={[globalStyles.input, styles.textArea]}
        placeholder="Agenda*" 
        value={agenda} 
        onChangeText={setAgenda} 
        multiline 
        placeholderTextColor={colors.muted}
      />
      
      {/* Instructions */}
      <TextInput 
        style={[globalStyles.input, styles.textArea]}
        placeholder="Instructions (Optional)" 
        value={instructions} 
        onChangeText={setInstructions} 
        multiline 
        placeholderTextColor={colors.muted}
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

<View style={styles.section}>
  <Text style={styles.sectionTitle}>Meeting Documents</Text>
  
  {documents.length > 0 && (
    <View style={styles.documentsContainer}>
      {documents.map((doc, index) => (
        <View key={index} style={styles.documentItem}>
          <Icon name="file-document-outline" size={20} color={colors.primary} />
          <Text style={styles.documentName} numberOfLines={1}>
            {doc.name}
          </Text>
          <TouchableOpacity onPress={() => handleRemoveDocument(index)}>
            <Icon name="close" size={16} color={colors.destructive} />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  )}

  <TouchableOpacity 
    style={[globalStyles.button, globalStyles.buttonOutline, styles.addDocumentButton]}
    onPress={handleDocumentPick}
    disabled={isUploading}
  >
    {isUploading ? (
      <ActivityIndicator size="small" color={colors.primary} />
    ) : (
      <>
        <Icon name="plus" size={16} color={colors.primary} />
        <Text style={[globalStyles.buttonText, globalStyles.buttonOutlineText]}>
          Add Document
        </Text>
      </>
    )}
  </TouchableOpacity>
</View>

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
        keyboardVerticalOffset={Platform.select({ ios: 0, android: 0 })}
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
              ListHeaderComponentStyle={{ paddingHorizontal: spacing.md }}
              ListFooterComponent={<View style={{height: 20}} />}
              ListEmptyComponent={
                loadingUsers ? (
                  <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />
                ) : usersError ? (
                  <Text style={styles.errorText}>{usersError}</Text>
                ) : null
              }
              contentContainerStyle={{ paddingBottom: 20 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[globalStyles.button, styles.submitButton]}
                onPress={handleSubmit}
                disabled={isUploading || loadingUsers}
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
// Styles
const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    safeArea: {
      flex: 1,
      marginTop: 50,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerContainer: {
      paddingBottom: spacing.md,
    },
    section: {
        marginTop: spacing.md,
        marginBottom: spacing.sm,
    },
    sectionHeader: {
      marginTop: spacing.md,
      marginBottom: spacing.lg,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      
    },
    sectionTitle: {
      ...typography.h3,
      color: colors.text,
      fontWeight: '600',
    },
    buttonContainer: {
      padding: spacing.md,
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
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: spacing.md,
    },
    pickerContainer: {
      flex: 1,
    },
    pickerText: {
      fontSize: 16,
      color: colors.text,
    },
    label: {
      ...typography.body,
      fontWeight: '500',
      marginBottom: spacing.sm,
      color: colors.text,
      marginTop: spacing.md,
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
      color: colors.text,
      fontWeight: '500',
    },
    durationChipTextSelected: {
      color: colors.white,
    },
    delegateCount: {
      ...typography.muted,
      color: colors.muted,
    },
    loader: {
      marginVertical: spacing.lg,
    },
    userItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    selectedUser: {
      
    },
    userName: {
      flex: 1,
      marginLeft: spacing.md,
      ...typography.body,
      fontWeight: '500',
    },
    userPortfolio: {
      ...typography.caption,
      color: colors.muted,
      marginLeft: 'auto',
    },
    errorText: {
      ...typography.muted,
      color: colors.destructive,
      textAlign: 'center',
      marginVertical: spacing.md,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md, 
    },
    addAllButton: {
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      backgroundColor: colors.secondary,
      borderRadius: 4,
    },
    addAllText: {
      ...typography.caption,
      color: colors.primary,
      fontWeight: '600',
    },
    documentsContainer: {
      marginBottom: spacing.md,
      marginTop: spacing.sm,
    },
    documentItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.sm,
      backgroundColor: colors.muted,
      borderRadius: 8,
      marginBottom: spacing.xs,
    },
    documentName: {
      flex: 1,
      marginLeft: spacing.sm,
      marginRight: spacing.sm,
      ...typography.body,
    },
    addDocumentButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      marginTop: spacing.xs,
    },
  });