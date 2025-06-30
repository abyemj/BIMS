// components/meetings/MeetingDetailModal.tsx
import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking,Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { globalStyles, colors, spacing, typography } from '@/styles/globalStyles';
import type { Meeting } from '@/types';

interface MeetingDetailModalProps {
  visible: boolean;
  meeting: Meeting | null;
  onClose: () => void;
  users: { id: string; fullName: string; email: string }[];
}

export const MeetingDetailModal: React.FC<MeetingDetailModalProps> = ({ 
  visible, 
  meeting, 
  onClose,
  users 
}) => {
  if (!meeting) return null;

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAttendeeNames = (ids: string[]) => {
    return ids.map(id => {
      const user = users.find(u => u.id === id);
      return user ? user.fullName : 'Unknown user';
    });
  };

  const handleDocumentPress = (url: string) => {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open this document');
      }
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={typography.h2}>{meeting.title}</Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={24} color={colors.muted} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Date & Time</Text>
            <Text style={styles.sectionText}>
              {formatDateTime(meeting.date)} ({meeting.duration} minutes)
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status</Text>
            <Text style={styles.sectionText}>{meeting.status}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Agenda</Text>
            <Text style={styles.sectionText}>{meeting.agenda}</Text>
          </View>

          {meeting.instructions && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Instructions</Text>
              <Text style={styles.sectionText}>{meeting.instructions}</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Attendees</Text>
            {getAttendeeNames(meeting.attendees).map((name, index) => (
              <Text key={index} style={styles.sectionText}>• {name}</Text>
            ))}
          </View>

          {meeting.invitedDelegates && meeting.invitedDelegates.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Invited Delegates</Text>
              {getAttendeeNames(meeting.invitedDelegates).map((name, index) => (
                <Text key={index} style={styles.sectionText}>• {name}</Text>
              ))}
            </View>
          )}

          {meeting.documents && meeting.documents.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Documents</Text>
              {meeting.documents.map((doc, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.documentItem}
                  onPress={() => handleDocumentPress(doc.url)}
                >
                  <Icon name="file-document-outline" size={20} color={colors.primary} />
                  <Text style={styles.documentName}>{doc.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {meeting.meetingLink && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Meeting Link</Text>
              <TouchableOpacity 
                style={styles.linkButton}
                onPress={() => Linking.openURL(meeting.meetingLink!)}
              >
                <Icon name="link-variant" size={20} color={colors.primary} />
                <Text style={styles.linkText}>Join Meeting</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg
  },
  content: {
    paddingBottom: spacing.xl
  },
  section: {
    marginBottom: spacing.lg
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.sm,
    color: colors.primary
  },
  sectionText: {
    ...typography.body,
    color: colors.text
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  documentName: {
    ...typography.body,
    marginLeft: spacing.sm,
    color: colors.primary
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: 8
  },
  linkText: {
    ...typography.body,
    marginLeft: spacing.sm,
    color: colors.primary
  }
});