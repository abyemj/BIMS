
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Linking , ViewStyle, TextStyle } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import type { User, Meeting } from '@/types';
import { globalStyles, colors, spacing, typography } from '@/styles/globalStyles';
import { format, parse } from 'date-fns';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Stack, Redirect } from 'expo-router';
import ScheduleMeetingModal from '@/components/meetings/ScheduleMeetingModal';
import { MeetingDetailModal } from '@/components/meetings/MeetingDetailModal';
import { createMeeting, startMeeting, endMeeting } from '@/services/video-conferencing';
import { sendNotification } from '@/services/notification';
import { databases,storage} from '@/lib/appwrite';
import {Query} from 'appwrite';




const formatMeetingTime = (dateTime: Date | string | null): string => {
  try {
    if (!dateTime) return 'Time not set';
    const dateObj = dateTime instanceof Date ? dateTime : new Date(dateTime);
    if (isNaN(dateObj.getTime())) return 'Invalid time';
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(dateObj);
  } catch (error) {
    console.warn('Error formatting meeting time:', error);
    return 'Error displaying time';
  }
};

const formatMeetingDateTime = (dateTime: Date | string | null): string => {
  try {
    if (!dateTime) return 'Date/time not set';
    const dateObj = dateTime instanceof Date ? dateTime : new Date(dateTime);
    if (isNaN(dateObj.getTime())) return 'Invalid date/time';
    return format(dateObj, 'MMM d, yyyy h:mm a');
  } catch (error) {
    console.warn('Error formatting meeting date/time:', error);
    return 'Error displaying date/time';
  }
};

const mapAppwriteToMeeting = (doc: any): Meeting => {

  return {
    id: doc.$id,
    date: doc.date ? new Date(doc.date) : new Date(),
    time: doc.time,
    duration: doc.duration,
    title: doc.title,
    agenda: doc.agenda,
    instructions: doc.instructions,
    status: doc.status || 'Scheduled',
    attendees: doc.attendees || [],
    invitedDelegates: doc.invitedDelegates || [],
    documents: Array.isArray(doc.documents) ? doc.documents : [],
    meetingLink: doc.meetingLink,
    tenant: doc.tenant
  };
};



const fetchMeetingsFromDB = async (user: User): Promise<Meeting[]> => {
  try {
    // First get all non-archived meetings for the tenant
    const response = await databases.listDocuments(
      '6848228c00222dfaf82e',
      '685a245d0014fa92ce37',
      [
        Query.equal('tenant', user.tenant),
        Query.notEqual('status', 'Archived')
      ]
    );

   
    if (user.role === 'Delegate') {
      console.log("Fetching meetings for delegate:", user.id);
      return response.documents
        .filter(doc => {
          const attendees = doc.attendees || [];
          const invitedDelegates = doc.invitedDelegates || [];
          console.log(attendees)
          return attendees.includes(user.id) || invitedDelegates.includes(user.id);
        })
        .map(mapAppwriteToMeeting);
    }

    return response.documents.map(mapAppwriteToMeeting);
  } catch (error) {
    console.error("Failed to fetch meetings:", error);
    throw error;
  }
};

const fetchArchivedMeetingsFromDB = async (tenant: string): Promise<Meeting[]> => {
  try {
    const response = await databases.listDocuments(
      '6848228c00222dfaf82e',
      '685a245d0014fa92ce37',
      [
        Query.equal('status', 'Archived'),
        Query.equal('tenant', tenant)
      ]
    );

    return response.documents.map(mapAppwriteToMeeting);
  } catch (error) {
    console.error("Failed to fetch archived meetings:", error);
    throw error;
  }
};

export default function MeetingsScreen() {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [archivedMeetings, setArchivedMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [viewingArchived, setViewingArchived] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [users, setUsers] = useState<User[]>([]);


  const loadMeetings = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      if (viewingArchived && (user.role === 'Director' || user.role === 'Chairman')) {
        const fetched = await fetchArchivedMeetingsFromDB(user.tenant);
        setArchivedMeetings(fetched);
        setMeetings([]);
      } else {
        const fetched = await fetchMeetingsFromDB(user);
        setMeetings(fetched);
        setArchivedMeetings([]);
      }
    } catch (err) {
      console.error("Failed to fetch meetings:", err);
      setError("Could not load meetings.");
    } finally {
      setIsLoading(false);
    }
  }, [user, viewingArchived]);

  useEffect(() => {
    if (user) {
      loadMeetings();
    } else {
      setIsLoading(false);
    }
  }, [user, loadMeetings]);



  const getChairman = async (): Promise<User | null> => {
    if (!user?.tenant) {
      console.error('No tenant found in user');
      return null;
    }
  
    try {
      const response = await databases.listDocuments(
        '6848228c00222dfaf82e',
        '68597845003de1b5dcc0',
        [
          Query.equal('tenant', user.tenant),
          Query.equal('role', 'Chairman'),
          Query.equal('status', 'Active'),
          Query.limit(1)
        ]
      );
  
      if (response.documents.length > 0) {
        const chairmanDoc = response.documents[0];
        return {
          id: chairmanDoc.$id, // Database document ID
          // authId: chairmanDoc.authId || chairmanDoc.$id, // Include auth ID if available
          fullName: chairmanDoc.name,
          email: chairmanDoc.email,
          phone: chairmanDoc.phone,
          role: chairmanDoc.role,
          portfolio: chairmanDoc.portfolio,
          status: chairmanDoc.status,
          avatarUrl: chairmanDoc.avatarUrl || '',
          tenant: chairmanDoc.tenant
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching chairman:', error);
      return null;
    }
  };
  
  const fetchUsers = async (): Promise<User[]> => {
    if (!user?.tenant) {
      console.error('No tenant found in user');
      return [];
    }
  
    try {
      const response = await databases.listDocuments(
        '6848228c00222dfaf82e',
        '68597845003de1b5dcc0',
        [
          Query.equal('tenant', user.tenant),
          Query.equal('status', 'Active')
        ]
      );
  
      return response.documents.map(doc => ({
        id: doc.$id, // Database document ID
        authId: doc.authId || doc.$id, // Include auth ID if available
        fullName: doc.name,
        email: doc.email,
        phone: doc.phone,
        role: doc.role,
        portfolio: doc.portfolio,
        status: doc.status,
        avatarUrl: doc.avatarUrl || '',
        tenant: doc.tenant
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  };


  // const handleScheduleMeeting = async (
  //   // `meetingData` now contains the full objects from the modal
  //   meetingData: any 
  // ): Promise<boolean> => {
  //   if (!user || user.role !== 'Director') return false;
  
  //   try {
  //     const chairman = await getChairman();
  //     const allAttendeeIds = new Set<string>(meetingData.invitedDelegates || []);
  //     if (chairman) allAttendeeIds.add(chairman.id);
  //     allAttendeeIds.add(user.id);
  
  //     const videoConfDetails = await createMeeting(meetingData.title, meetingData.date, meetingData.duration);
  
  //     // --- THIS IS THE CRITICAL FIX ---
  //     // `meetingData.documents` is the array of objects like [{ name: 'a.pdf', fileId: '123' }]
  //     // We map over it to get just the `fileId` string for each document.
  //     const documentFileIds = meetingData.documents
  //       ?.map((doc: { fileId: string }) => doc.fileId) // Get the fileId from each object
  //       .filter(Boolean) || [];          // Filter out any null/undefined values just in case
  
  //     // This is the clean object we will save to the Appwrite database
  //     const meetingPayload = {
  //       title: meetingData.title,
  //       date: meetingData.date,
  //       duration: meetingData.duration,
  //       agenda: meetingData.agenda,
  //       instructions: meetingData.instructions,
  //       status: editingMeeting ? meetingData.status : 'Scheduled', // Use existing status if editing
  //       meetingLink: videoConfDetails.joinUrl,
  //       attendees: Array.from(allAttendeeIds),
  //       invitedDelegates: meetingData.invitedDelegates,
  //       tenant: user.tenant,
  //       documents: documentFileIds, // Now contains a clean array of strings: ['id1', 'id2']
  //     };
  
  //     if (editingMeeting) {
  //       await databases.updateDocument(
  //         '6848228c00222dfaf82e',
  //         '685a245d0014fa92ce37',
  //         editingMeeting.id,
  //         meetingPayload
  //       );
  //       Alert.alert('Meeting Updated', `${meetingPayload.title} updated successfully.`);
  //     } else {
  //       await databases.createDocument(
  //         '6848228c00222dfaf82e',
  //         '685a245d0014fa92ce37',
  //         'unique()',
  //         meetingPayload
  //       );
  //       Alert.alert('Meeting Scheduled', `${meetingPayload.title} has been scheduled.`);
  //     }
  
  //     // Refresh the meetings list to show the new/updated data
  //     loadMeetings();
  
  //     try {
  //       const allUsers = await fetchUsers();
  //       const invitedUsers = allUsers.filter(u => allAttendeeIds.has(u.id));
  //       for (const invited of invitedUsers) {
  //         if (invited.id !== user.id) {
  //           await sendNotification({
  //             recipient: invited.email,
  //             subject: `Meeting Invitation: ${meetingData.title}`,
  //             body: `You've been invited to "${meetingData.title}" on ${format(meetingData.date, 'PPP')} at ${meetingData.time}. Agenda: ${meetingData.agenda}`,
  //           });
  //         }
  //       }
  //     } catch (notificationError) {
  //       console.warn('Notification error:', notificationError);
  //     }
  
  //     setEditingMeeting(null);
  //     return true;
  //   } catch (error) {
  //     console.error("Error saving meeting:", error);
  //     Alert.alert('Error', 'Could not save the meeting. Please try again.');
  //     return false;
  //   }
  // };

  const handleScheduleMeeting = async (
    meetingData: any 
  ): Promise<boolean> => {
    if (!user || user.role !== 'Director') return false;
  
    // --- DEBUGGING STEP 2 ---
    console.log("--- PARENT: Data received from modal ---");
    console.log(JSON.stringify(meetingData, null, 2));
    // --- END DEBUGGING ---
  
    try {
      const chairman = await getChairman();
      const allAttendeeIds = new Set<string>(meetingData.invitedDelegates || []);
      if (chairman) allAttendeeIds.add(chairman.id);
      allAttendeeIds.add(user.id);
  
      const videoConfDetails = await createMeeting(meetingData.title, meetingData.date, meetingData.duration);
  
      // --- DEBUGGING STEP 3 ---
      // Let's check what the map operation produces.
      const documentFileIds = meetingData.documents
        ?.map((doc: { fileId: string }) => doc.fileId)
        .filter(Boolean) || [];
      console.log("--- PARENT: Extracted documentFileIds to be saved:", documentFileIds, "---");
      // --- END DEBUGGING ---
  
      
      const meetingPayload = {
        title: meetingData.title,
        date: meetingData.date,
        duration: meetingData.duration,
        agenda: meetingData.agenda,
        instructions: meetingData.instructions,
        status: editingMeeting ? meetingData.status : 'Scheduled',
        meetingLink: videoConfDetails.joinUrl,
        attendees: Array.from(allAttendeeIds),
        invitedDelegates: meetingData.invitedDelegates,
        tenant: user.tenant,
        documents: documentFileIds, // This is what gets saved
      };
  
      // --- DEBUGGING STEP 4 ---
      console.log("--- PARENT: Final payload being sent to Appwrite ---");
      console.log(JSON.stringify(meetingPayload, null, 2));
      // --- END DEBUGGING ---
  
  
      if (editingMeeting) {
        // ... update logic
      } else {
        await databases.createDocument(
          '6848228c00222dfaf82e',
          '685a245d0014fa92ce37',
          'unique()',
          meetingPayload
        );
        Alert.alert('Meeting Scheduled', `${meetingPayload.title} has been scheduled.`);
      }
  
      loadMeetings();
  
      // ... notification logic ...
      
      setEditingMeeting(null);
      return true;
    } catch (error) {
      console.error("Error saving meeting:", error);
      Alert.alert('Error', 'Could not save the meeting. Please try again.');
      return false;
    }
  };
  

   const handleStartMeeting = async (meeting: Meeting) => {
      if (!user || user.role === 'Delegate') return;
      const url = meeting.meetingLink;
      if (url) {
          try {
              await startMeeting(meeting.id);
              setMeetings(prev => prev.map(m => m.id === meeting.id ? { ...m, status: 'Ongoing' } : m));
              Alert.alert('Meeting Started', `${meeting.title} is now ongoing.`);
              
              const supported = await Linking.canOpenURL(url);
              if (supported) {
                  await Linking.openURL(url);
              } else {
                  Alert.alert("Error", `Cannot open meeting link: ${url}`);
              }
          } catch (err) {
              Alert.alert('Error', 'Failed to start meeting or open link.');
          }
      } else {
           Alert.alert('No Link', 'Meeting link is not available for starting.');
      }
    };
  
    const handleJoinMeeting = async (meeting: Meeting) => {
      const url = meeting.meetingLink;
      if (url) {
          const supported = await Linking.canOpenURL(url);
          if (supported) {
              await Linking.openURL(url);
          } else {
              Alert.alert("Error", `Cannot open meeting link: ${url}`);
          }
      } else {
          Alert.alert('No Link', 'Meeting link is not available.');
      }
    };
  
    const handleEndMeeting = async (meetingId: string) => {
       if (!user || user.role === 'Delegate') return;
       try {
          // TODO: Update meeting status to 'Completed' in Appwrite
          await endMeeting(meetingId);
          setMeetings(prev => prev.map(m => m.id === meetingId ? {...m, status: 'Completed'} : m));
          Alert.alert('Meeting Ended', 'The meeting has been marked as completed.');
       } catch (err) {
          Alert.alert('Error', 'Failed to end meeting.');
       }
    };
  
    const handleArchiveMeeting = async (meetingId: string) => {
      if (!user || user.role === 'Delegate') return;
      
      try {

        await databases.updateDocument(
          '6848228c00222dfaf82e',
          '685a245d0014fa92ce37',
          meetingId,
          { status: 'Archived' }
        );
        
        setMeetings(prevMeetings => prevMeetings.filter(m => m.id !== meetingId));
        Alert.alert('Meeting Archived', 'The meeting has been archived.');
      } catch (error) {
        console.error('Error archiving meeting:', error);
        Alert.alert('Error', 'Failed to archive meeting.');
      }
    };
    
    const handleDeleteMeeting = async (meetingId: string) => {
      if (!user || user.role !== 'Director') return;
      
      try {
        // Delete meeting from Appwrite
        await databases.deleteDocument(
          '6848228c00222dfaf82e',
          '685a245d0014fa92ce37',
          meetingId
        );
        
        if (viewingArchived) {
          setArchivedMeetings(prev => prev.filter(m => m.id !== meetingId));
        } else {
          setMeetings(prev => prev.filter(m => m.id !== meetingId));
        }
        
        Alert.alert('Meeting Deleted', 'The meeting has been deleted.');
      } catch (error) {
        console.error('Error deleting meeting:', error);
        Alert.alert('Error', 'Failed to delete meeting.');
      }
    };
  
    const openScheduleModal = (meetingToEdit: Meeting | null = null) => {
      if (user?.role !== 'Director') {
          Alert.alert("Permission Denied", "Only Directors can schedule or edit meetings.");
          return;
      }
      setEditingMeeting(meetingToEdit);
      setIsModalVisible(true);
    };
  
    if ((!user && isLoading)) {
      return <View style={globalStyles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>;
    }
  
    if (!user) {
      return <Redirect href="/(auth)/login" />;
    }
  
    const renderMeetingItem = ({ item }: { item: Meeting }) => {
      const dateTime = formatMeetingDateTime(item.date);
  
      const getStatusBadge = (status: Meeting['status']): JSX.Element => {
          let style: ViewStyle[] = [globalStyles.badge];
          let textStyle: TextStyle[] = [globalStyles.badgeText];
          switch (status) {
              case 'Scheduled': style.push(globalStyles.badgeDefault as ViewStyle); textStyle.push(globalStyles.badgeDefaultText as TextStyle); break;
              case 'Ongoing': style.push(globalStyles.badgeSecondary as ViewStyle); textStyle.push(globalStyles.badgeSecondaryText as TextStyle); break;
              case 'Completed': style.push(globalStyles.badgeOutline as ViewStyle); textStyle.push(globalStyles.badgeOutlineText as TextStyle); break;
              case 'Archived': style.push(globalStyles.badgeDestructive as ViewStyle); textStyle.push(globalStyles.badgeDestructiveText as TextStyle); break;
          }
          return (<View style={style}><Text style={textStyle}>{status}</Text></View>);
      };
  
      return (
        <View style={globalStyles.card}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemTitle}>{item.title}</Text>
             {getStatusBadge(item.status)}
          </View>
          <Text style={styles.itemDetail}><Icon name="calendar" size={14} color={colors.muted} /> {dateTime}</Text>
          <Text style={styles.itemDetail}><Icon name="clock-outline" size={14} color={colors.muted} /> {item.duration} mins</Text>
          <Text style={styles.itemAgenda}>{item.agenda}</Text>
          
          {item.instructions && <Text style={styles.itemDetailSmall}><Icon name="information-outline" size={14} color={colors.muted} /> {item.instructions}</Text>}
          

          {item.documents && item.documents.length > 0 && (
            <View style={{marginTop: spacing.xs}}>
              <Text style={styles.itemDetailSmall}>
                <Icon name="paperclip" size={14} color={colors.muted} /> Documents attached: {item.documents.length}
              </Text>
              {/* Displaying IDs here is fine for a brief summary */}
            </View>
          )}

          <TouchableOpacity onPress={() => {setSelectedMeeting(item);setDetailModalVisible(true);}} style={styles.actionButton}>
            <Icon name="information" size={18} color={colors.muted} />
            <Text style={[styles.actionText, {color: colors.muted}]}>Details</Text>
          </TouchableOpacity>
  
           <View style={styles.actionsContainer}>
             {user?.role === 'Director' && item.status === 'Scheduled' && (
                 <TouchableOpacity onPress={() => handleStartMeeting(item)} style={styles.actionButton}>
                     <Icon name="play-circle-outline" size={18} color={colors.primary} /><Text style={styles.actionText}>Start</Text>
                 </TouchableOpacity>
             )}
             {user?.role === 'Director' && item.status === 'Ongoing' && (
                  <TouchableOpacity onPress={() => handleEndMeeting(item.id)} style={styles.actionButton}>
                      <Icon name="stop-circle-outline" size={18} color={colors.destructive} /><Text style={[styles.actionText, {color: colors.destructive}]}>End</Text>
                  </TouchableOpacity>
             )}
             {item.status !== 'Archived' && item.meetingLink && (
                  <TouchableOpacity onPress={() => handleJoinMeeting(item)} style={styles.actionButton}>
                      <Icon name="video-outline" size={18} color={colors.primary} /><Text style={styles.actionText}>Join</Text>
                  </TouchableOpacity>
              )}
             {user?.role === 'Director' && item.status === 'Scheduled' && (
                  <TouchableOpacity onPress={() => openScheduleModal(item)} style={styles.actionButton}>
                       <Icon name="pencil-outline" size={18} color={colors.muted} /><Text style={[styles.actionText, {color: colors.muted}]}>Reschedule</Text>
                  </TouchableOpacity>
             )}
             {(user?.role === 'Director' || user?.role === 'Chairman') && (item.status === 'Completed' || item.status === 'Scheduled') && (
                  <TouchableOpacity onPress={() => handleArchiveMeeting(item.id)} style={styles.actionButton}>
                       <Icon name="archive-arrow-down-outline" size={18} color={colors.muted} /><Text style={[styles.actionText, {color: colors.muted}]}>Archive</Text>
                  </TouchableOpacity>
             )}
             {user?.role === 'Director' && item.status === 'Archived' && (
                 <TouchableOpacity onPress={() => Alert.alert('Confirm Delete', `Delete "${item.title}"? This cannot be undone.`, [{text: 'Cancel'}, {text: 'Delete', onPress: () => handleDeleteMeeting(item.id), style: 'destructive'}])} style={styles.actionButton}>
                     <Icon name="trash-can-outline" size={18} color={colors.destructive} /><Text style={[styles.actionText, {color: colors.destructive}]}>Delete</Text>
                 </TouchableOpacity>
             )}
           </View>
        </View>
      );
    };
  
const meetingsToDisplay = viewingArchived 
? archivedMeetings
: meetings.filter(meeting => {
    // For directors/chairmen, show all active meetings
    if (user?.role === 'Director' || user?.role === 'Chairman') {
      return meeting.status !== 'Archived';
    }
    
    // For delegates, only show meetings they're invited to
    if (user?.role === 'Delegate') {
      return (
        meeting.status !== 'Archived' && 
        (meeting.attendees.includes(user.id) || 
         meeting.invitedDelegates?.includes(user.id))
      );
    }
    
    // Default fallback
    return meeting.status !== 'Archived';
  });
  
    return (
      <View style={globalStyles.container}>
        <Stack.Screen options={{ title: viewingArchived ? 'Archived Meetings' : 'Meetings' }} />
        <View style={styles.headerContainer}>
          <Text style={typography.h1}>{viewingArchived ? 'Archived Meetings' : 'Meetings'}</Text>
          <View style={styles.headerActions}>
              {(user?.role === 'Director' || user?.role === 'Chairman') && (
                  <TouchableOpacity onPress={() => setViewingArchived(!viewingArchived)} style={styles.headerButton}>
                      <Icon name={viewingArchived ? "calendar-check-outline" : "archive-arrow-down-outline"} size={20} color={colors.primary} />
                      <Text style={styles.headerButtonText}>{viewingArchived ? "Active" : "Archived"}</Text>
                  </TouchableOpacity>
              )}
              {user?.role === 'Director' && !viewingArchived && (
                  <TouchableOpacity onPress={() => openScheduleModal(null)} style={[globalStyles.button, styles.scheduleButton]}>
                  <Icon name="plus-circle-outline" size={20} color={colors.white} style={{marginRight: spacing.sm}}/>
                  <Text style={globalStyles.buttonText}>Schedule</Text>
                  </TouchableOpacity>
              )}
          </View>
        </View>
  
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : meetingsToDisplay.length === 0 ? (
          <View style={styles.emptyContainer}>
          <Icon name={viewingArchived ? "archive-outline" : "calendar-remove-outline"} size={60} color={colors.muted} />
          <Text style={typography.h3}>
            {user?.role === 'Delegate' 
              ? "No Meetings Assigned" 
              : `No ${viewingArchived ? "Archived" : ""} Meetings Found`}
          </Text>
          <Text style={typography.muted}>
            {user?.role === 'Delegate'
              ? "You haven't been invited to any meetings yet."
              : `There are no ${viewingArchived ? "archived" : "upcoming or relevant"} meetings.`}
          </Text>
                 {user?.role === 'Director' && !viewingArchived && (
                   <TouchableOpacity style={[globalStyles.button, {marginTop: spacing.lg}]} onPress={() => openScheduleModal(null)}>
                       <Icon name="plus-circle-outline" size={20} color={colors.white} style={{marginRight: spacing.sm}}/>
                       <Text style={globalStyles.buttonText}>Schedule New Meeting</Text>
                   </TouchableOpacity>
                 )}
            </View>
        ) : (
          <FlatList
            data={meetingsToDisplay}
            renderItem={renderMeetingItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: spacing.md }}
            showsVerticalScrollIndicator={false}
          />
        )}
        {/* Removed allUsers prop as it's fetched inside the modal via context */}
        <ScheduleMeetingModal
              visible={isModalVisible}
              onClose={() => { setIsModalVisible(false); setEditingMeeting(null); }}
              onSchedule={handleScheduleMeeting}
              initialData={editingMeeting || undefined}
        />
        <MeetingDetailModal
          visible={detailModalVisible}
          meeting={selectedMeeting}
          onClose={() => setDetailModalVisible(false)}
          users={users}
        />
      </View>
    );

}

 
  const styles = StyleSheet.create({
    ...globalStyles,
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
      paddingTop: spacing.sm,
      flexWrap: 'wrap',
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: spacing.sm,
      flexWrap: 'wrap',
    },
    headerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      backgroundColor: colors.card,
      borderRadius: 8,
    },
    headerButtonText: {
      ...typography.body,
      color: colors.primary,
      fontWeight: '500',
      marginLeft: spacing.xs,
  },
  scheduleButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  itemTitle: { fontSize: 18, fontWeight: 'bold', flexShrink: 1, marginRight: spacing.sm, color: colors.text },
  itemDetail: { fontSize: 14, color: colors.muted, marginBottom: spacing.xs, flexDirection: 'row', alignItems: 'center' },
  itemDetailSmall: { fontSize: 12, color: colors.muted, marginBottom: spacing.xs, flexDirection: 'row', alignItems: 'center' },
  itemAgenda: { fontSize: 14, color: colors.text, marginTop: spacing.xs, marginBottom: spacing.md },
  actionsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', gap: spacing.md, marginTop: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, paddingTop: spacing.sm },
  actionButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.xs },
  actionText: { marginLeft: spacing.xs, color: colors.primary, fontWeight: '500' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg, marginTop: 50 },
  errorText: { color: colors.destructive, textAlign: 'center', marginTop: 20 },
});

 