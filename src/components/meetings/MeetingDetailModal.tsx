

// import React, { useState, useEffect } from 'react';
// import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Alert, ActivityIndicator } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import { globalStyles, colors, spacing, typography } from '@/styles/globalStyles';
// import type { Meeting, User } from '@/types';
// import { useAuth } from '@/context/AuthContext';
// import { databases, storage } from '@/lib/appwrite'; 
// import { Query } from 'appwrite';

// interface MeetingDetailModalProps {
//   visible: boolean;
//   meeting: Meeting | null;
//   onClose: () => void;
// }

// export const MeetingDetailModal: React.FC<MeetingDetailModalProps> = ({ 
//   visible, 
//   meeting, 
//   onClose,
// }) => {
//   const { user } = useAuth();
//   const [participants, setParticipants] = useState<User[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [documentDetails, setDocumentDetails] = useState<Record<string, {
//     name: string;
//     type?: string;
//     url: string;
//   }>>({});
//   const [loadingDocuments, setLoadingDocuments] = useState(false);



//   useEffect(() => {



//   const loadDocumentDetails = async () => {
//     if (!meeting?.documents || meeting.documents.length === 0) {
//       setDocumentDetails({});
//       return;
//     }
  
//     try {
//       setLoadingDocuments(true);
//       const details: Record<string, { name: string; url: string }> = {};
  
//       await Promise.all(meeting.documents.map(async (fileIdOrUrl) => {
//         let fileId = '';
  
//         if (typeof fileIdOrUrl === 'string') {
//           if (fileIdOrUrl.startsWith('http')) {
//             try {
//               const pathSegments = new URL(fileIdOrUrl).pathname.split('/');
//               fileId = pathSegments[pathSegments.length - 2];
//             } catch (e) {
//               console.warn('Could not parse file ID from URL:', fileIdOrUrl);
//               fileId = 'invalid-url'; 
//             }
//           } else {
//             fileId = fileIdOrUrl;
//           }
//         } else if ((fileIdOrUrl as any)?.fileId) {
          
//           fileId = (fileIdOrUrl as any).fileId;
//         }
        
  
//         if (!fileId || fileId === 'invalid-url') {
//           details[fileIdOrUrl] = { name: 'Invalid Document Link', url: '' };
//           return;
//         }
  
//         try {
//           const file = await storage.getFile('685f599b0034c8890ccd', fileId);
//           const url = storage.getFileDownload('685f599b0034c8890ccd', fileId);
          
//           // Use the original string as the key to match the loop
//           details[fileIdOrUrl] = {
//             name: file.name,
//             url: url.href
//           };
//         } catch (error) {
//           console.error(`Error loading document with ID ${fileId}:`, error);
//           details[fileIdOrUrl] = { name: 'Unavailable Document', url: '' };
//         }
//       }));
  
//       setDocumentDetails(details);
//     } catch (error) {
//       console.error('General error in loadDocumentDetails:', error);
//     } finally {
//       setLoadingDocuments(false);
//     }
//   };
  


//   useEffect(() => {
//     const fetchParticipants = async () => {
//       if (!meeting || !user?.tenant) return;

//       try {
//         setLoading(true);
        
//         const allParticipantIds = [...new Set([
//           ...meeting.attendees,
//           ...(meeting.invitedDelegates || [])
//         ])];

//         if (allParticipantIds.length === 0) {
//           setParticipants([]);
//           return;
//         }

//         const response = await databases.listDocuments(
//           '6848228c00222dfaf82e',
//           '68597845003de1b5dcc0',
//           [
//             Query.equal('tenant', user.tenant),
//             Query.equal('status', 'Active'),
//             Query.equal('$id', allParticipantIds)
//           ]
//         );

//         setParticipants(response.documents.map(doc => ({
//           id: doc.$id,
//           authId: doc.authId,
//           fullName: doc.name,
//           email: doc.email,
//           role: doc.role
//         })));
//       } catch (error) {
//         console.error('Error fetching participants:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (visible && meeting) {
//       fetchParticipants();
//     }
//   }, [visible, meeting, user?.tenant]);

//   if (!meeting) return null;

//   const formatDateTime = (date: Date) => {
//     return date.toLocaleString('en-US', {
//       month: 'short',
//       day: 'numeric',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const handleDocumentPress = (url: string) => {
//     if (!url) {
//       Alert.alert('Error', 'This document cannot be opened');
//       return;
//     }
//     Linking.canOpenURL(url).then(supported => {
//       if (supported) {
//         Linking.openURL(url);
//       } else {
//         Alert.alert('Error', 'Cannot open this document');
//       }
//     });
//   };

//   return (
//     <Modal
//       visible={visible}
//       animationType="slide"
//       transparent={false}
//       onRequestClose={onClose}
//     >
//       <View style={styles.container}>
//         <View style={styles.header}>
//           <Text style={typography.h2}>{meeting.title}</Text>
//           <TouchableOpacity onPress={onClose}>
//             <Icon name="close" size={24} color={colors.muted} />
//           </TouchableOpacity>
//         </View>

//         <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
//           {loading ? (
//             <ActivityIndicator size="large" color={colors.primary} />
//           ) : (
//             <>
//               <View style={styles.section}>
//                 <Text style={styles.sectionTitle}>Date & Time</Text>
//                 <Text style={styles.sectionText}>
//                   {formatDateTime(meeting.date)} ({meeting.duration} minutes)
//                 </Text>
//               </View>

//               <View style={styles.section}>
//                 <Text style={styles.sectionTitle}>Status</Text>
//                 <Text style={styles.sectionText}>{meeting.status}</Text>
//               </View>

//               <View style={styles.section}>
//                 <Text style={styles.sectionTitle}>Agenda</Text>
//                 <Text style={styles.sectionText}>{meeting.agenda}</Text>
//               </View>

//               {meeting.instructions && (
//                 <View style={styles.section}>
//                   <Text style={styles.sectionTitle}>Instructions</Text>
//                   <Text style={styles.sectionText}>{meeting.instructions}</Text>
//                 </View>
//               )}

//               <View style={styles.section}>
//                 <Text style={styles.sectionTitle}>Participants ({participants.length})</Text>
//                 {participants.length > 0 ? (
//                   participants.map((participant) => (
//                     <View key={participant.id} style={styles.participantItem}>
//                       <Text style={styles.sectionText}>
//                         • {participant.fullName} ({participant.role})
//                       </Text>
//                     </View>
//                   ))
//                 ) : (
//                   <Text style={styles.sectionText}>No participants</Text>
//                 )}
//               </View>
  
//           {meeting.documents && meeting.documents.length > 0 && (
//             <View style={styles.section}>
//               <Text style={styles.sectionTitle}>Documents ({meeting.documents.length})</Text>
//               {loadingDocuments ? (
//                 <ActivityIndicator size="small" color={colors.primary} />
//               ) : (
//                 meeting.documents.map((fileIdOrUrl, index) => {
//                   const doc = documentDetails[fileIdOrUrl];
//                   return (
//                     <TouchableOpacity 
//                       key={index} // Use index for a stable key
//                       style={styles.documentItem}
//                       onPress={() => doc?.url ? handleDocumentPress(doc.url) : Alert.alert('Error', 'This document is unavailable or the link is invalid.')}
//                       disabled={!doc?.url}
//                     >
//                       <Icon 
//                         name={doc?.url ? "file-document-outline" : "alert-circle-outline"} 
//                         size={20} 
//                         color={doc?.url ? colors.primary : colors.destructive} 
//                       />
//                       <Text style={[
//                         styles.documentName,
//                         !doc?.url && { color: colors.destructive }
//                       ]}>
//                         {doc?.name || 'Processing...'}
//                       </Text>
//                     </TouchableOpacity>
//                   );
//                 })
//               )}
//             </View>
//           )}

//               {meeting.meetingLink && (
//                 <View style={styles.section}>
//                   <Text style={styles.sectionTitle}>Meeting Link</Text>
//                   <TouchableOpacity 
//                     style={styles.linkButton}
//                     onPress={() => Linking.openURL(meeting.meetingLink)}
//                   >
//                     <Icon name="link-variant" size={20} color={colors.primary} />
//                     <Text style={styles.linkText}>Join Meeting</Text>
//                   </TouchableOpacity>
//                 </View>
//               )}
//             </>
//           )}
//         </ScrollView>
//       </View>
//     </Modal>
//   );
// };


// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: spacing.lg,
//     backgroundColor: colors.background
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: spacing.lg
//   },
//   content: {
//     paddingBottom: spacing.xl
//   },
//   section: {
//     marginBottom: spacing.lg
//   },
//   sectionTitle: {
//     ...typography.h3,
//     marginBottom: spacing.sm,
//     color: colors.primary
//   },
//   sectionText: {
//     ...typography.body,
//     color: colors.text
//   },
//   participantItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: spacing.xs
//   },
//   participantType: {
//     ...typography.caption,
//     color: colors.muted,
//     fontStyle: 'italic'
//   },
//   documentItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: spacing.sm,
//     borderBottomWidth: 1,
//     borderBottomColor: colors.border
//   },
//   documentName: {
//     ...typography.body,
//     marginLeft: spacing.sm,
//     color: colors.primary
//   },
//   linkButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: spacing.sm,
//     backgroundColor: colors.card,
//     borderRadius: 8
//   },
//   linkText: {
//     ...typography.body,
//     marginLeft: spacing.sm,
//     color: colors.primary
//   }
// });


import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { globalStyles, colors, spacing, typography } from '@/styles/globalStyles';
import type { Meeting, User } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { databases, storage } from '@/lib/appwrite'; 
import { Query } from 'appwrite';

interface MeetingDetailModalProps {
  visible: boolean;
  meeting: Meeting | null;
  onClose: () => void;
}

export const MeetingDetailModal: React.FC<MeetingDetailModalProps> = ({ 
  visible, 
  meeting, 
  onClose,
}) => {
  const { user } = useAuth();
  const [participants, setParticipants] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [documentDetails, setDocumentDetails] = useState<Record<string, {
    name: string;
    type?: string;
    url: string;
  }>>({});
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  // --- FIX START: Separated useEffect hooks ---

  // Effect #1: Responsible for loading DOCUMENT details
  useEffect(() => {
    const loadDocumentDetails = async () => {
      if (!meeting?.documents || meeting.documents.length === 0) {
        setDocumentDetails({});
        return;
      }
    
      try {
        setLoadingDocuments(true);
        const details: Record<string, { name: string; url: string }> = {};
    
        // This logic is to handle both clean file IDs and potentially corrupted full URLs
        await Promise.all(meeting.documents.map(async (fileIdOrUrl) => {
          let fileId = '';
    
          if (typeof fileIdOrUrl === 'string') {
            if (fileIdOrUrl.startsWith('http')) {
              try {
                const pathSegments = new URL(fileIdOrUrl).pathname.split('/');
                fileId = pathSegments[pathSegments.length - 2];
              } catch (e) {
                console.warn('Could not parse file ID from URL:', fileIdOrUrl);
                fileId = 'invalid-url'; 
              }
            } else {
              fileId = fileIdOrUrl;
            }
          } else if ((fileIdOrUrl as any)?.fileId) {
            fileId = (fileIdOrUrl as any).fileId;
          }
    
          if (!fileId || fileId === 'invalid-url') {
            const key = typeof fileIdOrUrl === 'string' ? fileIdOrUrl : JSON.stringify(fileIdOrUrl);
            details[key] = { name: 'Invalid Document Link', url: '' };
            return;
          }
    
          try {
            const file = await storage.getFile('685f599b0034c8890ccd', fileId);
            // const url = storage.getFileDownload('685f599b0034c8890ccd', fileId);
            const url = storage.getFileView('685f599b0034c8890ccd', fileId);
            const key = typeof fileIdOrUrl === 'string' ? fileIdOrUrl : JSON.stringify(fileIdOrUrl);
            details[key] = {
              name: file.name,
              url: url.href
            };
          } catch (error) {
            console.error(`Error loading document with ID ${fileId}:`, error);
            const key = typeof fileIdOrUrl === 'string' ? fileIdOrUrl : JSON.stringify(fileIdOrUrl);
            details[key] = { name: 'Unavailable Document', url: '' };
          }
        }));
    
        setDocumentDetails(details);
      } catch (error) {
        console.error('General error in loadDocumentDetails:', error);
      } finally {
        setLoadingDocuments(false);
      }
    };

    if (visible && meeting) {
        loadDocumentDetails();
    }
  }, [visible, meeting]); // Dependency array for this effect

  // Effect #2: Responsible for loading PARTICIPANT details
  useEffect(() => {
    const fetchParticipants = async () => {
      if (!meeting || !user?.tenant) return;

      try {
        setLoading(true);
        
        const allParticipantIds = [...new Set([
          ...(meeting.attendees || []),
          ...(meeting.invitedDelegates || [])
        ])];

        if (allParticipantIds.length === 0) {
          setParticipants([]);
          setLoading(false); // Stop loading if no one to fetch
          return;
        }

        const response = await databases.listDocuments(
          '6848228c00222dfaf82e',
          '68597845003de1b5dcc0',
          [
            Query.equal('tenant', user.tenant),
            Query.equal('status', 'Active'),
            Query.equal('$id', allParticipantIds)
          ]
        );

        setParticipants(response.documents.map(doc => ({
          id: doc.$id,
          authId: doc.authId,
          fullName: doc.name,
          email: doc.email,
          role: doc.role
        } as User))); // Added type assertion for clarity
      } catch (error) {
        console.error('Error fetching participants:', error);
      } finally {
        setLoading(false);
      }
    };

    if (visible && meeting) {
      fetchParticipants();
    }
  }, [visible, meeting, user?.tenant]); // Dependency array for this effect

  // --- FIX END ---

  if (!meeting) return null;

  const formatDateTime = (date: Date) => {
    // Add a check for invalid dates
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        return "Invalid Date";
    }
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDocumentPress = (url: string) => {
    if (!url) {
      Alert.alert('Error', 'This document cannot be opened');
      return;
    }
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

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {(loading && participants.length === 0) ? ( // Show loader only on initial load
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <>
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
                <Text style={styles.sectionTitle}>Participants ({participants.length})</Text>
                {participants.length > 0 ? (
                  participants.map((participant) => (
                    <View key={participant.id} style={styles.participantItem}>
                      <Text style={styles.sectionText}>
                        • {participant.fullName} ({participant.role})
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.sectionText}>No participants found.</Text>
                )}
              </View>
  
              {meeting.documents && meeting.documents.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Documents ({meeting.documents.length})</Text>
                  {loadingDocuments ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    meeting.documents.map((fileIdOrUrl, index) => {
                      const key = typeof fileIdOrUrl === 'string' ? fileIdOrUrl : JSON.stringify(fileIdOrUrl);
                      const doc = documentDetails[key];
                      return (
                        <TouchableOpacity 
                          key={index} // Use index for a stable key
                          style={styles.documentItem}
                          onPress={() => doc?.url ? handleDocumentPress(doc.url) : Alert.alert('Error', 'This document is unavailable or the link is invalid.')}
                          disabled={!doc?.url}
                        >
                          <Icon 
                            name={doc?.url ? "file-document-outline" : "alert-circle-outline"} 
                            size={20} 
                            color={doc?.url ? colors.primary : colors.destructive} 
                          />
                          <Text style={[
                            styles.documentName,
                            !doc?.url && { color: colors.destructive }
                          ]}>
                            {doc?.name || 'Processing...'}
                          </Text>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </View>
              )}

              {meeting.meetingLink && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Meeting Link</Text>
                  <TouchableOpacity 
                    style={styles.linkButton}
                    onPress={() => Linking.openURL(meeting.meetingLink)}
                  >
                    <Icon name="link-variant" size={20} color={colors.primary} />
                    <Text style={styles.linkText}>Join Meeting</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}; // This closing brace is now correct (line 282)

// Styles remain the same
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
  participantItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs
  },
  participantType: {
    ...typography.caption,
    color: colors.muted,
    fontStyle: 'italic'
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