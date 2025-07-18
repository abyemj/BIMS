import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
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
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import { globalStyles, colors, spacing, typography } from '@/styles/globalStyles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { databases, storage, client, account } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { format } from 'date-fns';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import type { User, Meeting,MeetingFormData, ScheduleMeetingModalProps,meetingDocument } from '@/types';


// Constants
const durations = [
  { label: '30 minutes', value: 30 },
  { label: '45 minutes', value: 45 },
  { label: '1 hour', value: 60 },
  { label: '1.5 hours', value: 90 },
  { label: '2 hours', value: 120 },
];

const statusOptions = [
  { label: 'Scheduled', value: 'Scheduled' },
  { label: 'Ongoing', value: 'Ongoing' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Archived', value: 'Archived' },
];

export default function ScheduleMeetingModal({ visible, onClose, onSchedule, initialData }: ScheduleMeetingModalProps) {
  const { user } = useAuth();
  const { control, handleSubmit, setValue, watch, reset } = useForm<MeetingFormData>({
    defaultValues: {
      title: initialData?.title || '',
      date: initialData?.date ? new Date(initialData.date) : new Date(),
      time: initialData?.date ? new Date(initialData.date) : new Date(),
      duration: initialData?.duration || 60,
      agenda: initialData?.agenda || '',
      instructions: initialData?.instructions || '',
      status: initialData?.status || 'Scheduled',
      invitedDelegates: initialData?.invitedDelegates || [],
      documents: initialData?.documents || [],
    }
  });

  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<Array<{
    name: string;
    fileId: string;
    type?: string;
    size?: number;
  }>>([]);

  const formValues = watch();
  const { invitedDelegates, documents } = formValues;

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      if (!user?.tenant) return;
      
      try {
        setLoadingUsers(true);
        const response = await databases.listDocuments(
          '6848228c00222dfaf82e',
          '68597845003de1b5dcc0',
          [
            Query.equal('tenant', user.tenant),
            Query.equal('status', 'Active'),
            Query.equal('role', 'Delegate')
          ]
        );

        setUsers(response.documents.map(doc => ({
          id: doc.$id,
          fullName: doc.name,
          portfolio: doc.portfolio
        })));
      } catch (error) {
        setUsersError('Could not load users. Please try again.');
      } finally {
        setLoadingUsers(false);
      }
    };

    if (visible) fetchUsers();
  }, [visible, user?.tenant]);

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title,
        date: new Date(initialData.date),
        time: new Date(initialData.date),
        duration: initialData.duration,
        agenda: initialData.agenda,
        instructions: initialData.instructions,
        status: initialData.status,
        invitedDelegates: initialData.invitedDelegates,
        documents: initialData.documents || [],
      });
    }
  }, [initialData, reset]);

  const handleToggleDelegate = useCallback((userId: string) => {
    setValue('invitedDelegates', 
      invitedDelegates.includes(userId)
        ? invitedDelegates.filter(id => id !== userId)
        : [...invitedDelegates, userId]
    );
  }, [invitedDelegates, setValue]);

  const handleAddAllDelegates = useCallback(() => {
    const allUserIds = users.map(user => user.id);
    setValue('invitedDelegates',
      users.length === invitedDelegates.length ? [] : allUserIds
    );
  }, [users, invitedDelegates, setValue]);


const handleDocumentPick = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: false,
    });

    // Check if the user cancelled the picker
    if (!result.assets || result.assets.length === 0) {
      return;
    }

    setIsUploading(true);
    const asset = result.assets[0];

    // File size check
    if (asset.size && asset.size > 10 * 1024 * 1024) {
      Alert.alert('Error', 'File size exceeds 10MB limit.');
      setIsUploading(false);
      return;
    }

    
    const jwt = await account.createJWT();

    const formData = new FormData();
    formData.append('fileId', 'unique()'); 
    formData.append('file', {
      uri: asset.uri,
      name: asset.name,
      type: asset.mimeType || 'application/octet-stream',
    } as any);

    
    const response = await fetch(
      `https://fra.cloud.appwrite.io/v1/storage/buckets/685f599b0034c8890ccd/files`,
      {
        method: 'POST',
        headers: {
          'X-Appwrite-JWT': jwt.jwt, 
          'X-Appwrite-Project': '68482013000712591aa2',
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      }
    );

    const uploadedFile = await response.json();

    if (!response.ok) {
      throw new Error(uploadedFile.message || 'File upload failed.');
    }

    const newDocument = {
      name: asset.name,
      fileId: uploadedFile.$id,
      type: asset.mimeType || 'unknown',
      size: asset.size || 0,
    };

    const currentDocs = watch('documents') || [];
    setValue('documents', [...currentDocs, newDocument]);

    Alert.alert('Success', 'Document uploaded successfully!');

  } catch (error: any) {
    console.error('Upload error:', error);
    Alert.alert('Error', error.message || 'Failed to upload document. Please check your connection and try again.');
  } finally {
    setIsUploading(false);
  }
};


  const handleRemoveDocument = useCallback((index: number) => {
    setValue('documents', documents.filter((_, i) => i !== index));
  }, [documents, setValue]);


const onSubmit = async (data: MeetingFormData) => {
  if (!data.title || !data.agenda) {
    Alert.alert('Required fields', 'Please fill in all required fields');
    return;
  }

  const meetingDateTime = new Date(
    data.date.getFullYear(),
    data.date.getMonth(),
    data.date.getDate(),
    data.time.getHours(),
    data.time.getMinutes()
  );

  const meetingData = {
    title: data.title,
    date: meetingDateTime,
    duration: data.duration,
    agenda: data.agenda,
    instructions: data.instructions,
    invitedDelegates: data.invitedDelegates,
    documents: data.documents, 
    status: data.status,
  };

  
  // console.log("--- MODAL: Data being sent to parent (onSchedule) ---");
  // console.log(JSON.stringify(meetingData, null, 2));
  

  try {
    const success = await onSchedule(meetingData);
    if (success) {
      onClose(); 
    }
  } catch (error) {
    console.error("Error during onSchedule call:", error);
    Alert.alert('Error', 'Could not schedule the meeting.');
  }
};


  const renderDelegateList = () => {
    if (loadingUsers) {
      return <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />;
    }

    if (usersError) {
      return <Text style={styles.errorText}>{usersError}</Text>;
    }

    return users.map((user) => (
      <TouchableOpacity
        key={user.id}
        style={[
          styles.userItem,
          invitedDelegates.includes(user.id) && styles.selectedUser
        ]}
        onPress={() => handleToggleDelegate(user.id)}
        activeOpacity={0.7}
      >
        <Icon
          name={invitedDelegates.includes(user.id) ? 'checkbox-marked' : 'checkbox-blank-outline'}
          size={24}
          color={invitedDelegates.includes(user.id) ? colors.primary : colors.muted}
        />
        <Text style={styles.userName}>{user.fullName}</Text>
        <Text style={styles.userPortfolio}>{user.portfolio}</Text>
      </TouchableOpacity>
    ));
  };

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

            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Form Fields */}
              <View style={styles.formContainer}>
                <Controller
                  control={control}
                  name="title"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={globalStyles.input}
                      placeholder="Meeting Title*"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholderTextColor={colors.muted}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="agenda"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[globalStyles.input, styles.textArea]}
                      placeholder="Agenda*"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      multiline
                      placeholderTextColor={colors.muted}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="instructions"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[globalStyles.input, styles.textArea]}
                      placeholder="Instructions (Optional)"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      multiline
                      placeholderTextColor={colors.muted}
                    />
                  )}
                />

                {/* Date/Time Row */}
                <View style={styles.row}>
                  <View style={styles.pickerContainer}>
                    <Text style={styles.label}>Date*</Text>
                    <Controller
                      control={control}
                      name="date"
                      render={({ field: { value } }) => (
                        <TouchableOpacity 
                          onPress={() => setShowDatePicker(true)} 
                          style={globalStyles.input}
                        >
                          <Text style={styles.pickerText}>{format(value, 'PPP')}</Text>
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                  <View style={styles.pickerContainer}>
                    <Text style={styles.label}>Time*</Text>
                    <Controller
                      control={control}
                      name="time"
                      render={({ field: { value } }) => (
                        <TouchableOpacity 
                          onPress={() => setShowTimePicker(true)} 
                          style={globalStyles.input}
                        >
                          <Text style={styles.pickerText}>{format(value, 'p')}</Text>
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                </View>

                {showDatePicker && (
                  <Controller
                    control={control}
                    name="date"
                    render={({ field: { onChange, value } }) => (
                      <DateTimePicker
                        value={value}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                          setShowDatePicker(false);
                          if (selectedDate) onChange(selectedDate);
                        }}
                        minimumDate={new Date()}
                      />
                    )}
                  />
                )}

                {showTimePicker && (
                  <Controller
                    control={control}
                    name="time"
                    render={({ field: { onChange, value } }) => (
                      <DateTimePicker
                        value={value}
                        mode="time"
                        display="default"
                        onChange={(event, selectedTime) => {
                          setShowTimePicker(false);
                          if (selectedTime) onChange(selectedTime);
                        }}
                      />
                    )}
                  />
                )}

                <Text style={styles.label}>Duration*</Text>
                <View style={styles.durationContainer}>
                  {durations.map(d => (
                    <TouchableOpacity
                      key={d.value}
                      style={[
                        styles.durationChip,
                        formValues.duration === d.value && styles.durationChipSelected
                      ]}
                      onPress={() => setValue('duration', d.value)}
                    >
                      <Text style={[
                        styles.durationChipText,
                        formValues.duration === d.value && styles.durationChipTextSelected
                      ]}>
                        {d.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {initialData && (
                  <>
                    <Text style={styles.label}>Status*</Text>
                    <View style={styles.durationContainer}>
                      {statusOptions.map(s => (
                        <TouchableOpacity
                          key={s.value}
                          style={[
                            styles.durationChip,
                            formValues.status === s.value && styles.durationChipSelected
                          ]}
                          onPress={() => setValue('status', s.value)}
                        >
                          <Text style={[
                            styles.durationChipText,
                            formValues.status === s.value && styles.durationChipTextSelected
                          ]}>
                            {s.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                )}

                {/* Documents Section */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Meeting Documents</Text>
                  {documents.map((doc, index) => (
                    <View key={index} style={styles.documentItem}>
                      <Icon name="file-document-outline" size={20} color={colors.primary} />
                      <Text style={styles.documentName} numberOfLines={1}>{doc.name}</Text>
                      <TouchableOpacity onPress={() => handleRemoveDocument(index)}>
                        <Icon name="close" size={16} color={colors.destructive} />
                      </TouchableOpacity>
                    </View>
                  ))}
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

                {/* Delegates Section */}
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

                {/* Delegates List */}
                {renderDelegateList()}
              </View>
            </ScrollView>

            {/* Submit Button */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[globalStyles.button, styles.submitButton]}
                onPress={handleSubmit(onSubmit)}
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
}

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
  scrollContent: {
    paddingBottom: 100,
  },
  formContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
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
  delegateCount: {
    ...typography.muted,
    color: colors.muted,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colors.lightMuted,
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
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectedUser: {
    backgroundColor: colors.lightPrimary,
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
  loader: {
    marginVertical: spacing.lg,
  },
  errorText: {
    ...typography.muted,
    color: colors.destructive,
    textAlign: 'center',
    marginVertical: spacing.md,
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
});