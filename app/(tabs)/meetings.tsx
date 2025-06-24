
// import React, { useState, useEffect, useCallback } from 'react';
// import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
// import { useAuth } from '@/context/AuthContext'; // Adjust path
// import type { User, Meeting } from '@/types'; // Adjust path
// import { globalStyles, colors, spacing, typography } from '@/styles/globalStyles'; // Adjust path
// import { format } from 'date-fns';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import { Stack } from 'expo-router';

// // Dummy data fetching functions
// const fetchMeetings = async (userRole: User['role']): Promise<Meeting[]> => {
//   await new Promise(resolve => setTimeout(resolve, 1500));
//    const allMeetings: Meeting[] = [
//         { id: 'm1', date: new Date(2024, 6, 25), time: '10:00', duration: 60, title: 'Budget Review Q3', agenda: 'Discuss Q3 budget allocation.', status: 'Scheduled', attendees: ['User1', 'User2', 'Delegate1'], meetingLink: 'https://meet.example.com/abc' },
//         { id: 'm2', date: new Date(2024, 6, 28), time: '14:00', duration: 90, title: 'Project Alpha Kickoff', agenda: 'Finalize project plan and roles.', status: 'Scheduled', attendees: ['User1', 'Director1', 'Delegate2'], meetingLink: 'https://meet.example.com/def' },
//         { id: 'm3', date: new Date(2024, 6, 20), time: '09:00', duration: 45, title: 'Weekly Standup', agenda: 'Team updates.', status: 'Completed', attendees: ['User1', 'User2', 'Director1'] },
//         { id: 'm4', date: new Date(2024, 5, 15), time: '11:00', duration: 60, title: 'Infrastructure Planning', agenda: 'Review server upgrades.', status: 'Archived', attendees: ['User1', 'Director1'] },
//     ];
//     if (userRole === 'Delegate') {
//         return allMeetings.filter(m => m.attendees?.includes('Delegate1') && m.status !== 'Archived');
//     }
//     return allMeetings.filter(m => m.status !== 'Archived');
// };

// export default function MeetingsScreen() {
//   const { user } = useAuth();
//   const [meetings, setMeetings] = useState<Meeting[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const loadMeetings = useCallback(async () => {
//     if (!user) return;
//     setIsLoading(true);
//     setError(null);
//     try {
//       const fetchedMeetings = await fetchMeetings(user.role);
//       setMeetings(fetchedMeetings);
//     } catch (err) {
//       console.error("Failed to fetch meetings:", err);
//       setError("Could not load meetings.");
//     } finally {
//       setIsLoading(false);
//     }
//   }, [user]);

//   useEffect(() => {
//     loadMeetings();
//   }, [loadMeetings]);

//   const handleActionPress = (meeting: Meeting, action: string) => {
//      Alert.alert('Action', `${action} meeting: ${meeting.title}`);
//   };

//   const renderMeetingItem = ({ item }: { item: Meeting }) => {
//      const isPast = item.status === 'Completed' || item.status === 'Archived';
//      const dateTime = `${format(new Date(item.date), 'PPP')} at ${format(new Date(`1970-01-01T${item.time}:00`), 'p')}`;

//     const getStatusBadge = (status: Meeting['status']) => {
//         let style = [globalStyles.badge];
//         let textStyle = [globalStyles.badgeText];
//         // switch (status) {
//         //     case 'Scheduled': style.push(globalStyles.badgeDefault); textStyle.push(globalStyles.badgeDefaultText); break;
//         //     case 'Ongoing': style.push(globalStyles.badgeSecondary); textStyle.push(globalStyles.badgeSecondaryText); break;
//         //     case 'Completed': style.push(globalStyles.badgeOutline); textStyle.push(globalStyles.badgeOutlineText); break;
//         //     case 'Archived': style.push(globalStyles.badgeDestructive); textStyle.push(globalStyles.badgeDestructiveText); break;
//         // }
//         return (<View style={style}><Text style={textStyle}>{status}</Text></View>);
//     };

//     return (
//       <View style={globalStyles.card}>
//         <View style={styles.itemHeader}>
//           <Text style={styles.itemTitle}>{item.title}</Text>
//            {getStatusBadge(item.status)}
//         </View>
//         <Text style={styles.itemDetail}><Icon name="calendar" size={14} color={colors.muted} /> {dateTime}</Text>
//         <Text style={styles.itemDetail}><Icon name="clock-outline" size={14} color={colors.muted} /> {item.duration} mins</Text>
//         <Text style={styles.itemAgenda}>{item.agenda}</Text>
//          <View style={styles.actionsContainer}>
//            {user?.role !== 'Delegate' && item.status === 'Scheduled' && (
//                <TouchableOpacity onPress={() => handleActionPress(item, 'Start')} style={styles.actionButton}>
//                    <Icon name="play-circle-outline" size={18} color={colors.primary} /><Text style={styles.actionText}>Start</Text>
//                </TouchableOpacity>
//            )}
//            {user?.role !== 'Delegate' && item.status === 'Ongoing' && (
//                 <TouchableOpacity onPress={() => handleActionPress(item, 'End')} style={styles.actionButton}>
//                     <Icon name="stop-circle-outline" size={18} color={colors.destructive} /><Text style={[styles.actionText, {color: colors.destructive}]}>End</Text>
//                 </TouchableOpacity>
//            )}
//            {item.status !== 'Archived' && item.meetingLink && (
//                 <TouchableOpacity onPress={() => handleActionPress(item, 'Join')} style={styles.actionButton}>
//                     <Icon name="video-outline" size={18} color={colors.primary} /><Text style={styles.actionText}>Join</Text>
//                 </TouchableOpacity>
//             )}
//            {user?.role === 'Director' && isPast && item.status !== 'Archived' && (
//                 <TouchableOpacity onPress={() => handleActionPress(item, 'Archive')} style={styles.actionButton}>
//                      <Icon name="archive-arrow-down-outline" size={18} color={colors.muted} /><Text style={[styles.actionText, {color: colors.muted}]}>Archive</Text>
//                 </TouchableOpacity>
//            )}
//          </View>
//       </View>
//     );
//   };

//   return (
//     <View style={globalStyles.container}>
//       <Stack.Screen options={{ title: 'Meetings' }} />
//       <Text style={typography.h1}>Meetings</Text>
//       {isLoading ? (
//         <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
//       ) : error ? (
//         <Text style={styles.errorText}>{error}</Text>
//       ) : meetings.length === 0 ? (
//           <View style={styles.emptyContainer}>
//               <Icon name="calendar-remove-outline" size={60} color={colors.muted} />
//               <Text style={typography.h3}>No Meetings Found</Text>
//               <Text style={typography.muted}>There are no upcoming or relevant meetings.</Text>
//                {user?.role === 'Director' && (
//                  <TouchableOpacity style={[globalStyles.button, {marginTop: spacing.lg}]} onPress={() => Alert.alert('Schedule', 'Open Schedule Meeting Modal')}>
//                      <Text style={globalStyles.buttonText}>Schedule New Meeting</Text>
//                  </TouchableOpacity>
//                )}
//           </View>
//       ) : (
//         <FlatList
//           data={meetings}
//           renderItem={renderMeetingItem}
//           keyExtractor={(item) => item.id}
//           contentContainerStyle={{ paddingBottom: spacing.md }}
//         />
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
//   itemTitle: { fontSize: 18, fontWeight: 'bold', flexShrink: 1, marginRight: spacing.sm },
//   itemDetail: { fontSize: 14, color: colors.muted, marginBottom: spacing.xs, flexDirection: 'row', alignItems: 'center' },
//   itemAgenda: { fontSize: 14, color: colors.text, marginTop: spacing.xs, marginBottom: spacing.md },
//   actionsContainer: { flexDirection: 'row', justifyContent: 'flex-start', gap: spacing.md, marginTop: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, paddingTop: spacing.sm },
//   actionButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.xs },
//   actionText: { marginLeft: spacing.xs, color: colors.primary, fontWeight: '500' },
//   emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg, marginTop: 50 },
//   errorText: { color: colors.destructive, textAlign: 'center', marginTop: 20 },
// });




// import React, { useState, useEffect, useCallback } from 'react';
// import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, ViewStyle, TextStyle } from 'react-native';
// import { useAuth } from '@/context/AuthContext'; // Adjust path
// import type { User, Meeting } from '@/types'; // Adjust path
// import { globalStyles, colors, spacing, typography } from '@/styles/globalStyles'; // Adjust path
// import { format } from 'date-fns';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import { Stack } from 'expo-router';

// // Dummy data fetching functions
// const fetchMeetings = async (userRole: User['role']): Promise<Meeting[]> => {
//   await new Promise(resolve => setTimeout(resolve, 1500));
//    const allMeetings: Meeting[] = [
//         { id: 'm1', date: new Date(2024, 6, 25), time: '10:00', duration: 60, title: 'Budget Review Q3', agenda: 'Discuss Q3 budget allocation.', status: 'Scheduled', attendees: ['User1', 'User2', 'Delegate1'], meetingLink: 'https://meet.example.com/abc' },
//         { id: 'm2', date: new Date(2024, 6, 28), time: '14:00', duration: 90, title: 'Project Alpha Kickoff', agenda: 'Finalize project plan and roles.', status: 'Scheduled', attendees: ['User1', 'Director1', 'Delegate2'], meetingLink: 'https://meet.example.com/def' },
//         { id: 'm3', date: new Date(2024, 6, 20), time: '09:00', duration: 45, title: 'Weekly Standup', agenda: 'Team updates.', status: 'Completed', attendees: ['User1', 'User2', 'Director1'] },
//         { id: 'm4', date: new Date(2024, 5, 15), time: '11:00', duration: 60, title: 'Infrastructure Planning', agenda: 'Review server upgrades.', status: 'Archived', attendees: ['User1', 'Director1'] },
//     ];
//     if (userRole === 'Delegate') {
//         return allMeetings.filter(m => m.attendees?.includes('Delegate1') && m.status !== 'Archived');
//     }
//     return allMeetings.filter(m => m.status !== 'Archived');
// };

// export default function MeetingsScreen() {
//   const { user } = useAuth();
//   const [meetings, setMeetings] = useState<Meeting[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const loadMeetings = useCallback(async () => {
//     if (!user) return;
//     setIsLoading(true);
//     setError(null);
//     try {
//       const fetchedMeetings = await fetchMeetings(user.role);
//       setMeetings(fetchedMeetings);
//     } catch (err) {
//       console.error("Failed to fetch meetings:", err);
//       setError("Could not load meetings.");
//     } finally {
//       setIsLoading(false);
//     }
//   }, [user]);

//   useEffect(() => {
//     loadMeetings();
//   }, [loadMeetings]);

//   const handleActionPress = (meeting: Meeting, action: string) => {
//      Alert.alert('Action', `${action} meeting: ${meeting.title}`);
//   };

//   const renderMeetingItem = ({ item }: { item: Meeting }) => {
//      const isPast = item.status === 'Completed' || item.status === 'Archived';
//      const dateTime = `${format(new Date(item.date), 'PPP')} at ${format(new Date(`1970-01-01T${item.time}:00`), 'p')}`;

//     const getStatusBadge = (status: Meeting['status']) => {
//         let style: ViewStyle[] = [globalStyles.badge];
//         let textStyle: TextStyle[] = [globalStyles.badgeText];
//         switch (status) {
//             case 'Scheduled': style.push(globalStyles.badgeDefault); textStyle.push(globalStyles.badgeDefaultText); break;
//             case 'Ongoing': style.push(globalStyles.badgeSecondary); textStyle.push(globalStyles.badgeSecondaryText); break;
//             case 'Completed': style.push(globalStyles.badgeOutline); textStyle.push(globalStyles.badgeOutlineText); break;
//             case 'Archived': style.push(globalStyles.badgeDestructive); textStyle.push(globalStyles.badgeDestructiveText); break;
//         }
//         return (<View style={style}><Text style={textStyle}>{status}</Text></View>);
//     };

//     return (
//       <View style={globalStyles.card}>
//         <View style={styles.itemHeader}>
//           <Text style={styles.itemTitle}>{item.title}</Text>
//            {getStatusBadge(item.status)}
//         </View>
//         <Text style={styles.itemDetail}><Icon name="calendar" size={14} color={colors.muted} /> {dateTime}</Text>
//         <Text style={styles.itemDetail}><Icon name="clock-outline" size={14} color={colors.muted} /> {item.duration} mins</Text>
//         <Text style={styles.itemAgenda}>{item.agenda}</Text>
//          <View style={styles.actionsContainer}>
//            {user?.role !== 'Delegate' && item.status === 'Scheduled' && (
//                <TouchableOpacity onPress={() => handleActionPress(item, 'Start')} style={styles.actionButton}>
//                    <Icon name="play-circle-outline" size={18} color={colors.primary} /><Text style={styles.actionText}>Start</Text>
//                </TouchableOpacity>
//            )}
//            {user?.role !== 'Delegate' && item.status === 'Ongoing' && (
//                 <TouchableOpacity onPress={() => handleActionPress(item, 'End')} style={styles.actionButton}>
//                     <Icon name="stop-circle-outline" size={18} color={colors.destructive} /><Text style={[styles.actionText, {color: colors.destructive}]}>End</Text>
//                 </TouchableOpacity>
//            )}
//            {item.status !== 'Archived' && item.meetingLink && (
//                 <TouchableOpacity onPress={() => handleActionPress(item, 'Join')} style={styles.actionButton}>
//                     <Icon name="video-outline" size={18} color={colors.primary} /><Text style={styles.actionText}>Join</Text>
//                 </TouchableOpacity>
//             )}
//            {user?.role === 'Director' && isPast && item.status !== 'Archived' && (
//                 <TouchableOpacity onPress={() => handleActionPress(item, 'Archive')} style={styles.actionButton}>
//                      <Icon name="archive-arrow-down-outline" size={18} color={colors.muted} /><Text style={[styles.actionText, {color: colors.muted}]}>Archive</Text>
//                 </TouchableOpacity>
//            )}
//          </View>
//       </View>
//     );
//   };

//   return (
//     <View style={globalStyles.container}>
//       <Stack.Screen options={{ title: 'Meetings' }} />
//       <Text style={typography.h1}>Meetings</Text>
//       {isLoading ? (
//         <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
//       ) : error ? (
//         <Text style={styles.errorText}>{error}</Text>
//       ) : meetings.length === 0 ? (
//           <View style={styles.emptyContainer}>
//               <Icon name="calendar-remove-outline" size={60} color={colors.muted} />
//               <Text style={typography.h3}>No Meetings Found</Text>
//               <Text style={typography.muted}>There are no upcoming or relevant meetings.</Text>
//                {user?.role === 'Director' && (
//                  <TouchableOpacity style={[globalStyles.button, {marginTop: spacing.lg}]} onPress={() => Alert.alert('Schedule', 'Open Schedule Meeting Modal')}>
//                      <Text style={globalStyles.buttonText}>Schedule New Meeting</Text>
//                  </TouchableOpacity>
//                )}
//           </View>
//       ) : (
//         <FlatList
//           data={meetings}
//           renderItem={renderMeetingItem}
//           keyExtractor={(item) => item.id}
//           contentContainerStyle={{ paddingBottom: spacing.md }}
//           showsVerticalScrollIndicator={false} 
//         />
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
//   itemTitle: { fontSize: 18, fontWeight: 'bold', flexShrink: 1, marginRight: spacing.sm },
//   itemDetail: { fontSize: 14, color: colors.muted, marginBottom: spacing.xs, flexDirection: 'row', alignItems: 'center' },
//   itemAgenda: { fontSize: 14, color: colors.text, marginTop: spacing.xs, marginBottom: spacing.md },
//   actionsContainer: { flexDirection: 'row', justifyContent: 'flex-start', gap: spacing.md, marginTop: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, paddingTop: spacing.sm },
//   actionButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.xs },
//   actionText: { marginLeft: spacing.xs, color: colors.primary, fontWeight: '500' },
//   emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg, marginTop: 50 },
//   errorText: { color: colors.destructive, textAlign: 'center', marginTop: 20 },
// });




// import React, { useState, useEffect, useCallback } from 'react';
// import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Linking, ViewStyle, TextStyle } from 'react-native';
// import { useAuth } from '@/context/AuthContext'; // Adjust path
// import type { User, Meeting } from '@/types'; // Adjust path
// import { globalStyles, colors, spacing, typography } from '@/styles/globalStyles'; // Adjust path
// import { format, parse } from 'date-fns';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import { Stack } from 'expo-router';
// import ScheduleMeetingModal from '@/components/meetings/ScheduleMeetingModal'; // Import the modal
// import { createMeeting, startMeeting, endMeeting } from '@/services/video-conferencing';
// import { sendNotification } from '@/services/notification';

// // Dummy data fetching functions
// const fetchMeetings = async (userRole: User['role'], userId: string): Promise<Meeting[]> => {
//   await new Promise(resolve => setTimeout(resolve, 1500));
//    const allMeetings: Meeting[] = [
//         { id: 'm1', date: new Date(2024, 7, 25), time: '10:00', duration: 60, title: 'Budget Review Q4', agenda: 'Discuss Q4 budget allocation and Q3 performance.', instructions: "Please review Q3 financial report before the meeting.", status: 'Scheduled', attendees: ['user1', 'user2', 'user3'], invitedDelegates: ['user3'], documents: [{name: 'Q3_report.pdf', url: '#'}], meetingLink: 'https://meet.gov-connect.example.com/join/exco-mtg-q4budget' },
//         { id: 'm2', date: new Date(2024, 7, 28), time: '14:00', duration: 90, title: 'Project Phoenix Update', agenda: 'Review progress on Project Phoenix, discuss roadblocks and next steps.', status: 'Scheduled', attendees: ['user1', 'user2', 'user4'], invitedDelegates: ['user4'], meetingLink: 'https://meet.gov-connect.example.com/join/exco-mtg-phoenix' },
//         { id: 'm3', date: new Date(2024, 7, 20), time: '09:00', duration: 45, title: 'Department Heads Sync', agenda: 'Weekly sync with all department heads.', instructions: "Come prepared with your department's key updates and challenges.", status: 'Completed', attendees: ['user1', 'user2'], meetingLink: undefined },
//         { id: 'm4', date: new Date(2024, 6, 15), time: '11:00', duration: 60, title: 'Old Infrastructure Plan', agenda: 'Review server upgrades.', status: 'Archived', attendees: ['user1', 'user2'], meetingLink: undefined },
//     ];
//     if (userRole === 'Delegate') {
//         return allMeetings.filter(m => m.attendees?.includes(userId) && m.status !== 'Archived');
//     }
//     return allMeetings.filter(m => m.status !== 'Archived'); // Chairman/Director see all non-archived
// };

// const fetchArchivedMeetings = async (): Promise<Meeting[]> => {
//      await new Promise(resolve => setTimeout(resolve, 1000));
//      return [
//         { id: 'm4', date: new Date(2024, 6, 15), time: '11:00', duration: 60, title: 'Old Infrastructure Plan', agenda: 'Review server upgrades.', status: 'Archived', attendees: ['user1', 'user2'], meetingLink: undefined },
//         { id: 'm5', date: new Date(2024, 5, 10), time: '15:00', duration: 75, title: 'Old Policy Review', agenda: 'Review new policy document.', status: 'Archived', attendees: ['user1', 'user2', 'user3'], invitedDelegates: ['user3'], meetingLink: undefined },
//      ]
// }


// export default function MeetingsScreen() {
//   const { user, getChairman, fetchUsers } = useAuth();
//   const [meetings, setMeetings] = useState<Meeting[]>([]);
//   const [archivedMeetings, setArchivedMeetings] = useState<Meeting[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
//   const [allUsers, setAllUsers] = useState<User[]>([]);
//   const [viewingArchived, setViewingArchived] = useState(false);


//   const loadAllUsers = useCallback(async () => {
//     try {
//         const users = await fetchUsers();
//         setAllUsers(users);
//     } catch (err) {
//         console.error("Failed to fetch users for modal:", err);
//         // Handle error, maybe show a toast
//     }
//   }, [fetchUsers]);


//   const loadMeetings = useCallback(async () => {
//     if (!user) return;
//     setIsLoading(true);
//     setError(null);
//     try {
//       if (viewingArchived && (user.role === 'Director' || user.role === 'Chairman')) {
//            const fetched = await fetchArchivedMeetings();
//            setArchivedMeetings(fetched);
//            setMeetings([]); // Clear active meetings when viewing archived
//       } else {
//            const fetched = await fetchMeetings(user.role, user.id);
//            setMeetings(fetched);
//            setArchivedMeetings([]); // Clear archived when viewing active
//       }
//     } catch (err) {
//       console.error("Failed to fetch meetings:", err);
//       setError("Could not load meetings.");
//     } finally {
//       setIsLoading(false);
//     }
//   }, [user, viewingArchived]);

//   useEffect(() => {
//     loadMeetings();
//     if (user?.role === 'Director') {
//         loadAllUsers(); // Load users if Director for the modal
//     }
//   }, [loadMeetings, user?.role, loadAllUsers]);

//   const handleScheduleMeeting = async (
//     meetingData: Omit<Meeting, 'id' | 'status' | 'meetingLink' | 'attendees'> & { invitedDelegates: string[] }
//   ): Promise<boolean> => {
//     if (!user || user.role !== 'Director') return false;

//     const chairman = getChairman();
//     let allAttendeeIds = new Set<string>(meetingData.invitedDelegates || []);
//     if (chairman) {
//       allAttendeeIds.add(chairman.id);
//     }
//     allAttendeeIds.add(user.id); // Add the scheduling Director

//     try {
//       const videoConfDetails = await createMeeting(meetingData.title, meetingData.date, meetingData.duration);

//       const newMeeting: Meeting = {
//         ...meetingData,
//         id: editingMeeting?.id || `m${Date.now()}`,
//         status: 'Scheduled',
//         meetingLink: videoConfDetails.joinUrl,
//         attendees: Array.from(allAttendeeIds),
//       };

//       if (editingMeeting) {
//         setMeetings(prev => prev.map(m => m.id === editingMeeting.id ? newMeeting : m));
//         Alert.alert('Meeting Rescheduled', `${newMeeting.title} updated successfully.`);
//       } else {
//         setMeetings(prev => [newMeeting, ...prev]);
//         Alert.alert('Meeting Scheduled', `${newMeeting.title} has been successfully scheduled.`);
//       }

//       const invitedUsers = allUsers.filter(u => allAttendeeIds.has(u.id));
//       for (const invited of invitedUsers) {
//         if (invited.id !== user.id) { // Don't notify self
//              await sendNotification({
//                recipient: invited.email,
//                subject: `Meeting Invitation: ${meetingData.title}`,
//                body: `You have been invited to the meeting "${meetingData.title}" on ${format(meetingData.date, 'PPP')} at ${meetingData.time}. Agenda: ${meetingData.agenda}`,
//              });
//              console.log(`RN Notification sent to ${invited.email} for meeting ${meetingData.title}`);
//         }
//       }
//       setEditingMeeting(null);
//       return true;
//     } catch (error) {
//       console.error("Error scheduling/rescheduling meeting:", error);
//       Alert.alert(
//         editingMeeting ? 'Reschedule Failed' : 'Scheduling Failed',
//         'Could not save the meeting. Please try again.'
//       );
//       return false;
//     }
//   };

//   const handleStartMeeting = async (meeting: Meeting) => {
//     if (!user || user.role === 'Delegate') return;
//     const url = meeting.meetingLink;
//     if (url) { // Check if link exists
//         try {
//             await startMeeting(meeting.id); // Service call
//             setMeetings(prev => prev.map(m => m.id === meeting.id ? { ...m, status: 'Ongoing' } : m));
//             Alert.alert('Meeting Started', `${meeting.title} is now ongoing.`);
            
//             const supported = await Linking.canOpenURL(url);
//             if (supported) {
//                 await Linking.openURL(url);
//             } else {
//                 Alert.alert("Error", `Cannot open meeting link: ${url}`);
//             }
//         } catch (err) {
//             Alert.alert('Error', 'Failed to start meeting or open link.');
//         }
//     } else {
//          Alert.alert('No Link', 'Meeting link is not available for starting.');
//     }
//   };

//   const handleJoinMeeting = async (meeting: Meeting) => {
//     const url = meeting.meetingLink;
//     if (url) { // Check if link exists
//         const supported = await Linking.canOpenURL(url);
//         if (supported) {
//             await Linking.openURL(url);
//         } else {
//             Alert.alert("Error", `Cannot open meeting link: ${url}`);
//         }
//     } else {
//         Alert.alert('No Link', 'Meeting link is not available.');
//     }
//   };

//   const handleEndMeeting = async (meetingId: string) => {
//      if (!user || user.role === 'Delegate') return;
//      try {
//         await endMeeting(meetingId);
//         setMeetings(prev => prev.map(m => m.id === meetingId ? {...m, status: 'Completed'} : m));
//         Alert.alert('Meeting Ended', 'The meeting has been marked as completed.');
//      } catch (err) {
//         Alert.alert('Error', 'Failed to end meeting.');
//      }
//   };

//   const handleArchiveMeeting = (meetingId: string) => {
//     if (!user || user.role === 'Delegate') return; // Only Director/Chairman can archive
//     setMeetings(prevMeetings => prevMeetings.filter(m => m.id !== meetingId));
//     // Optionally, add to an archivedMeetings state if you want to display them separately.
//     // For now, it just removes from active meetings.
//     Alert.alert('Meeting Archived', 'The meeting has been archived.');
//   };

//   const handleDeleteMeeting = (meetingId: string) => {
//     if (!user || user.role !== 'Director') return; // Only Director can delete
//     if (viewingArchived) {
//         setArchivedMeetings(prev => prev.filter(m => m.id !== meetingId));
//     } else {
//         setMeetings(prev => prev.filter(m => m.id !== meetingId));
//     }
//      Alert.alert('Meeting Deleted', 'The meeting has been deleted.');
//   };


//   const openScheduleModal = (meetingToEdit: Meeting | null = null) => {
//     setEditingMeeting(meetingToEdit);
//     setIsModalVisible(true);
//   };


//   const renderMeetingItem = ({ item }: { item: Meeting }) => {
//      const dateTime = `${format(new Date(item.date), 'PPP')} at ${format(parse(item.time, 'HH:mm', new Date()), 'p')}`;

//     const getStatusBadge = (status: Meeting['status']): JSX.Element => {
//         let style: ViewStyle[] = [globalStyles.badge];
//         let textStyle: TextStyle[] = [globalStyles.badgeText];
//         switch (status) {
//             case 'Scheduled': style.push(globalStyles.badgeDefault as ViewStyle); textStyle.push(globalStyles.badgeDefaultText as TextStyle); break;
//             case 'Ongoing': style.push(globalStyles.badgeSecondary as ViewStyle); textStyle.push(globalStyles.badgeSecondaryText as TextStyle); break;
//             case 'Completed': style.push(globalStyles.badgeOutline as ViewStyle); textStyle.push(globalStyles.badgeOutlineText as TextStyle); break;
//             case 'Archived': style.push(globalStyles.badgeDestructive as ViewStyle); textStyle.push(globalStyles.badgeDestructiveText as TextStyle); break;
//         }
//         return (<View style={style}><Text style={textStyle}>{status}</Text></View>);
//     };

//     return (
//       <View style={globalStyles.card}>
//         <View style={styles.itemHeader}>
//           <Text style={styles.itemTitle}>{item.title}</Text>
//            {getStatusBadge(item.status)}
//         </View>
//         <Text style={styles.itemDetail}><Icon name="calendar" size={14} color={colors.muted} /> {dateTime}</Text>
//         <Text style={styles.itemDetail}><Icon name="clock-outline" size={14} color={colors.muted} /> {item.duration} mins</Text>
//         <Text style={styles.itemAgenda}>{item.agenda}</Text>
//         {item.instructions && <Text style={styles.itemDetailSmall}><Icon name="information-outline" size={14} color={colors.muted} /> {item.instructions}</Text>}
//         {item.documents && item.documents.length > 0 && (
//             <View style={{marginTop: spacing.xs}}>
//                 <Text style={styles.itemDetailSmall}><Icon name="paperclip" size={14} color={colors.muted} /> Documents:</Text>
//                 {item.documents.map((doc, idx) => <Text key={idx} style={[styles.itemDetailSmall, { marginLeft: spacing.md }]}>- {doc.name}</Text>)}
//             </View>
//         )}

//          <View style={styles.actionsContainer}>
//            {user?.role === 'Director' && item.status === 'Scheduled' && (
//                <TouchableOpacity onPress={() => handleStartMeeting(item)} style={styles.actionButton}>
//                    <Icon name="play-circle-outline" size={18} color={colors.primary} /><Text style={styles.actionText}>Start</Text>
//                </TouchableOpacity>
//            )}
//            {user?.role === 'Director' && item.status === 'Ongoing' && (
//                 <TouchableOpacity onPress={() => handleEndMeeting(item.id)} style={styles.actionButton}>
//                     <Icon name="stop-circle-outline" size={18} color={colors.destructive} /><Text style={[styles.actionText, {color: colors.destructive}]}>End</Text>
//                 </TouchableOpacity>
//            )}
//            {item.status !== 'Archived' && item.meetingLink && (
//                 <TouchableOpacity onPress={() => handleJoinMeeting(item)} style={styles.actionButton}>
//                     <Icon name="video-outline" size={18} color={colors.primary} /><Text style={styles.actionText}>Join</Text>
//                 </TouchableOpacity>
//             )}
//            {user?.role === 'Director' && item.status === 'Scheduled' && (
//                 <TouchableOpacity onPress={() => openScheduleModal(item)} style={styles.actionButton}>
//                      <Icon name="pencil-outline" size={18} color={colors.muted} /><Text style={[styles.actionText, {color: colors.muted}]}>Reschedule</Text>
//                 </TouchableOpacity>
//            )}
//            {(user?.role === 'Director' || user?.role === 'Chairman') && (item.status === 'Completed' || item.status === 'Scheduled') && (
//                 <TouchableOpacity onPress={() => handleArchiveMeeting(item.id)} style={styles.actionButton}>
//                      <Icon name="archive-arrow-down-outline" size={18} color={colors.muted} /><Text style={[styles.actionText, {color: colors.muted}]}>Archive</Text>
//                 </TouchableOpacity>
//            )}
//            {user?.role === 'Director' && item.status === 'Archived' && (
//                <TouchableOpacity onPress={() => Alert.alert('Confirm Delete', `Delete "${item.title}"? This cannot be undone.`, [{text: 'Cancel'}, {text: 'Delete', onPress: () => handleDeleteMeeting(item.id), style: 'destructive'}])} style={styles.actionButton}>
//                    <Icon name="trash-can-outline" size={18} color={colors.destructive} /><Text style={[styles.actionText, {color: colors.destructive}]}>Delete</Text>
//                </TouchableOpacity>
//            )}
//          </View>
//       </View>
//     );
//   };

//   const meetingsToDisplay = viewingArchived ? archivedMeetings : meetings;

//   return (
//     <View style={globalStyles.container}>
//       <Stack.Screen options={{ title: viewingArchived ? 'Archived Meetings' : 'Meetings' }} />
//       <View style={styles.headerContainer}>
//         <Text style={typography.h1}>{viewingArchived ? 'Archived Meetings' : 'Meetings'}</Text>
//         <View style={styles.headerActions}>
//             {(user?.role === 'Director' || user?.role === 'Chairman') && (
//                 <TouchableOpacity onPress={() => setViewingArchived(!viewingArchived)} style={styles.headerButton}>
//                     <Icon name={viewingArchived ? "calendar-check-outline" : "archive-arrow-down-outline"} size={20} color={colors.primary} />
//                     <Text style={styles.headerButtonText}>{viewingArchived ? "Active" : "Archived"}</Text>
//                 </TouchableOpacity>
//             )}
//             {user?.role === 'Director' && !viewingArchived && (
//                 <TouchableOpacity onPress={() => openScheduleModal(null)} style={[globalStyles.button, styles.scheduleButton]}>
//                 <Icon name="plus-circle-outline" size={20} color={colors.white} style={{marginRight: spacing.sm}}/>
//                 <Text style={globalStyles.buttonText}>Schedule</Text>
//                 </TouchableOpacity>
//             )}
//         </View>
//       </View>

//       {isLoading ? (
//         <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
//       ) : error ? (
//         <Text style={styles.errorText}>{error}</Text>
//       ) : meetingsToDisplay.length === 0 ? (
//           <View style={styles.emptyContainer}>
//               <Icon name={viewingArchived ? "archive-outline" : "calendar-remove-outline"} size={60} color={colors.muted} />
//               <Text style={typography.h3}>No {viewingArchived ? "Archived" : ""} Meetings Found</Text>
//               <Text style={typography.muted}>There are no {viewingArchived ? "archived" : "upcoming or relevant"} meetings.</Text>
//                {user?.role === 'Director' && !viewingArchived && (
//                  <TouchableOpacity style={[globalStyles.button, {marginTop: spacing.lg}]} onPress={() => openScheduleModal(null)}>
//                      <Icon name="plus-circle-outline" size={20} color={colors.white} style={{marginRight: spacing.sm}}/>
//                      <Text style={globalStyles.buttonText}>Schedule New Meeting</Text>
//                  </TouchableOpacity>
//                )}
//           </View>
//       ) : (
//         <FlatList
//           data={meetingsToDisplay}
//           renderItem={renderMeetingItem}
//           keyExtractor={(item) => item.id}
//           contentContainerStyle={{ paddingBottom: spacing.md }}
//           showsVerticalScrollIndicator={false}
//         />
//       )}
//       {user?.role === 'Director' && (
//         <ScheduleMeetingModal
//             visible={isModalVisible}
//             onClose={() => { setIsModalVisible(false); setEditingMeeting(null); }}
//             onSchedule={handleScheduleMeeting}
//             initialData={editingMeeting || undefined}
//             allUsers={allUsers}
//         />
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   headerContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: spacing.md, // Increased bottom margin for title
//     paddingTop: spacing.sm, // Added padding to push content down from top
//   },
//   headerActions: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flexShrink: 1, // Allow actions to shrink if needed
//   },
//   headerButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: spacing.sm,
//     paddingVertical: spacing.xs,
//     marginLeft: spacing.sm,
//   },
//   headerButtonText: {
//       ...typography.body,
//       color: colors.primary,
//       fontWeight: '500',
//       marginLeft: spacing.xs,
//   },
//   scheduleButton: {
//     paddingVertical: spacing.sm,
//     paddingHorizontal: spacing.md, // Adjust padding as needed
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginLeft: spacing.sm, // Added margin to separate from archive button
//     marginTop: spacing.sm,
//   },
//   itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
//   itemTitle: { fontSize: 18, fontWeight: 'bold', flexShrink: 1, marginRight: spacing.sm, color: colors.text },
//   itemDetail: { fontSize: 14, color: colors.muted, marginBottom: spacing.xs, flexDirection: 'row', alignItems: 'center' },
//   itemDetailSmall: { fontSize: 12, color: colors.muted, marginBottom: spacing.xs, flexDirection: 'row', alignItems: 'center' },
//   itemAgenda: { fontSize: 14, color: colors.text, marginTop: spacing.xs, marginBottom: spacing.md },
//   actionsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', gap: spacing.md, marginTop: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, paddingTop: spacing.sm },
//   actionButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.xs },
//   actionText: { marginLeft: spacing.xs, color: colors.primary, fontWeight: '500' },
//   emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg, marginTop: 50 },
//   errorText: { color: colors.destructive, textAlign: 'center', marginTop: 20 },
// });




// import React, { useState, useEffect, useCallback } from 'react';
// import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Linking, ViewStyle, TextStyle } from 'react-native';
// import { useAuth } from '@/context/AuthContext';
// import type { User, Meeting } from '@/types';
// import { globalStyles, colors, spacing, typography } from '@/styles/globalStyles';
// import { format, parse } from 'date-fns';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import { Stack, Redirect } from 'expo-router';
// import ScheduleMeetingModal from '@/components/meetings/ScheduleMeetingModal';
// import { createMeeting, startMeeting, endMeeting } from '@/services/video-conferencing';
// import { sendNotification } from '@/services/notification';

// // Dummy data fetching functions - replace with Appwrite calls
// const fetchMeetingsFromDB = async (user: User): Promise<Meeting[]> => {
//   // TODO: Replace with Appwrite database query
//   console.log("Fetching meetings from (simulated) DB for user:", user.id, user.role);
//   await new Promise(resolve => setTimeout(resolve, 1500));
//    const allMeetings: Meeting[] = [ // Keep some dummy data for UI structure until DB is fully wired
//         { id: 'm1', date: new Date(2024, 7, 25), time: '10:00', duration: 60, title: 'Budget Review Q4', agenda: 'Discuss Q4 budget allocation and Q3 performance.', instructions: "Please review Q3 financial report before the meeting.", status: 'Scheduled', attendees: ['user1-appwrite', 'user2-appwrite', 'user3-appwrite'], invitedDelegates: ['user3-appwrite'], documents: [{name: 'Q3_report.pdf', url: '#'}], meetingLink: 'https://meet.jit.si/EXCOConnect-RN-BudgetReviewQ4-dummy1' },
//         { id: 'm2', date: new Date(2024, 7, 28), time: '14:00', duration: 90, title: 'Project Phoenix Update', agenda: 'Review progress on Project Phoenix, discuss roadblocks and next steps.', status: 'Scheduled', attendees: ['user1-appwrite', 'user2-appwrite', 'user4-appwrite'], invitedDelegates: ['user4-appwrite'], meetingLink: 'https://meet.jit.si/EXCOConnect-RN-ProjectPhoenix-dummy2' },
//         { id: 'm3', date: new Date(2024, 7, 20), time: '09:00', duration: 45, title: 'Department Heads Sync', agenda: 'Weekly sync with all department heads.', instructions: "Come prepared with your department's key updates and challenges.", status: 'Completed', attendees: ['user1-appwrite', 'user2-appwrite'], meetingLink: undefined },
//     ];
//     if (user.role === 'Delegate') {
//         return allMeetings.filter(m => m.attendees?.includes(user.id) && m.status !== 'Archived');
//     }
//     return allMeetings.filter(m => m.status !== 'Archived');
// };

// const fetchArchivedMeetingsFromDB = async (): Promise<Meeting[]> => {
//      // TODO: Replace with Appwrite database query
//      console.log("Fetching archived meetings from (simulated) DB");
//      await new Promise(resolve => setTimeout(resolve, 1000));
//      return [
//         { id: 'm4', date: new Date(2024, 6, 15), time: '11:00', duration: 60, title: 'Old Infrastructure Plan', agenda: 'Review server upgrades.', status: 'Archived', attendees: ['user1-appwrite', 'user2-appwrite'], meetingLink: undefined },
//      ];
// };


// export default function MeetingsScreen() {
//   const { user, getChairman, fetchUsers, loading: authLoading } = useAuth();
//   const [meetings, setMeetings] = useState<Meeting[]>([]);
//   const [archivedMeetings, setArchivedMeetings] = useState<Meeting[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
//   const [viewingArchived, setViewingArchived] = useState(false);


//   const loadMeetings = useCallback(async () => {
//     if (!user) return;
//     setIsLoading(true);
//     setError(null);
//     try {
//       if (viewingArchived && (user.role === 'Director' || user.role === 'Chairman')) {
//            const fetched = await fetchArchivedMeetingsFromDB(); // Use new DB function
//            setArchivedMeetings(fetched);
//            setMeetings([]);
//       } else {
//            const fetched = await fetchMeetingsFromDB(user); // Use new DB function
//            setMeetings(fetched);
//            setArchivedMeetings([]);
//       }
//     } catch (err) {
//       console.error("Failed to fetch meetings:", err);
//       setError("Could not load meetings.");
//     } finally {
//       setIsLoading(false);
//     }
//   }, [user, viewingArchived]);

//   useEffect(() => {
//     if (!authLoading && user) {
//         loadMeetings();
//     } else if (!authLoading && !user) {
//         setIsLoading(false); // No user, redirect will handle
//     }
//   }, [authLoading, user, loadMeetings]);

//   const handleScheduleMeeting = async (
//     meetingData: Omit<Meeting, 'id' | 'status' | 'meetingLink' | 'attendees'> & { invitedDelegates: string[] }
//   ): Promise<boolean> => {
//     if (!user || user.role !== 'Director') return false;

//     const chairman = await getChairman(); // Now async
//     let allAttendeeIds = new Set<string>(meetingData.invitedDelegates || []);
//     if (chairman) {
//       allAttendeeIds.add(chairman.id);
//     }
//     allAttendeeIds.add(user.id);

//     try {
//       // TODO: Save meeting to Appwrite database
//       const videoConfDetails = await createMeeting(meetingData.title, meetingData.date, meetingData.duration);

//       const newMeeting: Meeting = {
//         ...meetingData,
//         id: editingMeeting?.id || `m${Date.now()}`, // Use Appwrite $id in real integration
//         status: 'Scheduled',
//         meetingLink: videoConfDetails.joinUrl,
//         attendees: Array.from(allAttendeeIds),
//       };

//       if (editingMeeting) {
//         // TODO: Update existing meeting in Appwrite
//         setMeetings(prev => prev.map(m => m.id === editingMeeting.id ? newMeeting : m));
//         Alert.alert('Meeting Rescheduled', `${newMeeting.title} updated successfully.`);
//       } else {
//         // TODO: Create new meeting in Appwrite
//         setMeetings(prev => [newMeeting, ...prev]);
//         Alert.alert('Meeting Scheduled', `${newMeeting.title} has been successfully scheduled.`);
//       }

//       const allUsers = await fetchUsers(); // Fetch all users for notifications
//       const invitedUsers = allUsers.filter(u => allAttendeeIds.has(u.id));
//       for (const invited of invitedUsers) {
//         if (invited.id !== user.id) {
//              await sendNotification({
//                recipient: invited.email,
//                subject: `Meeting Invitation: ${meetingData.title}`,
//                body: `You have been invited to the meeting "${meetingData.title}" on ${format(meetingData.date, 'PPP')} at ${meetingData.time}. Agenda: ${meetingData.agenda}`,
//              });
//              console.log(`RN Notification sent to ${invited.email} for meeting ${meetingData.title}`);
//         }
//       }
//       setEditingMeeting(null);
//       return true;
//     } catch (error) {
//       console.error("Error scheduling/rescheduling meeting:", error);
//       Alert.alert(
//         editingMeeting ? 'Reschedule Failed' : 'Scheduling Failed',
//         'Could not save the meeting. Please try again.'
//       );
//       return false;
//     }
//   };

//   const handleStartMeeting = async (meeting: Meeting) => {
//     if (!user || user.role === 'Delegate') return;
//     const url = meeting.meetingLink;
//     if (url) {
//         try {
//             // TODO: Update meeting status to 'Ongoing' in Appwrite
//             await startMeeting(meeting.id);
//             setMeetings(prev => prev.map(m => m.id === meeting.id ? { ...m, status: 'Ongoing' } : m));
//             Alert.alert('Meeting Started', `${meeting.title} is now ongoing.`);
            
//             const supported = await Linking.canOpenURL(url);
//             if (supported) {
//                 await Linking.openURL(url);
//             } else {
//                 Alert.alert("Error", `Cannot open meeting link: ${url}`);
//             }
//         } catch (err) {
//             Alert.alert('Error', 'Failed to start meeting or open link.');
//         }
//     } else {
//          Alert.alert('No Link', 'Meeting link is not available for starting.');
//     }
//   };

//   const handleJoinMeeting = async (meeting: Meeting) => {
//     const url = meeting.meetingLink;
//     if (url) {
//         const supported = await Linking.canOpenURL(url);
//         if (supported) {
//             await Linking.openURL(url);
//         } else {
//             Alert.alert("Error", `Cannot open meeting link: ${url}`);
//         }
//     } else {
//         Alert.alert('No Link', 'Meeting link is not available.');
//     }
//   };

//   const handleEndMeeting = async (meetingId: string) => {
//      if (!user || user.role === 'Delegate') return;
//      try {
//         // TODO: Update meeting status to 'Completed' in Appwrite
//         await endMeeting(meetingId);
//         setMeetings(prev => prev.map(m => m.id === meetingId ? {...m, status: 'Completed'} : m));
//         Alert.alert('Meeting Ended', 'The meeting has been marked as completed.');
//      } catch (err) {
//         Alert.alert('Error', 'Failed to end meeting.');
//      }
//   };

//   const handleArchiveMeeting = (meetingId: string) => {
//     if (!user || user.role === 'Delegate') return;
//     // TODO: Update meeting status to 'Archived' in Appwrite
//     setMeetings(prevMeetings => prevMeetings.filter(m => m.id !== meetingId));
//     Alert.alert('Meeting Archived', 'The meeting has been archived.');
//   };

//   const handleDeleteMeeting = (meetingId: string) => {
//     if (!user || user.role !== 'Director') return;
//     // TODO: Delete meeting from Appwrite
//     if (viewingArchived) {
//         setArchivedMeetings(prev => prev.filter(m => m.id !== meetingId));
//     } else {
//         setMeetings(prev => prev.filter(m => m.id !== meetingId));
//     }
//      Alert.alert('Meeting Deleted', 'The meeting has been deleted.');
//   };

//   const openScheduleModal = (meetingToEdit: Meeting | null = null) => {
//     if (user?.role !== 'Director') {
//         Alert.alert("Permission Denied", "Only Directors can schedule or edit meetings.");
//         return;
//     }
//     setEditingMeeting(meetingToEdit);
//     setIsModalVisible(true);
//   };

//   if (authLoading || (!user && isLoading)) {
//     return <View style={globalStyles.centered}><ActivityIndicator size="large" color={colors.primary} /></View>;
//   }

//   if (!user) {
//     return <Redirect href="/(auth)/login" />;
//   }

//   const renderMeetingItem = ({ item }: { item: Meeting }) => {
//      const dateTime = `${format(new Date(item.date), 'PPP')} at ${format(parse(item.time, 'HH:mm', new Date()), 'p')}`;

//     const getStatusBadge = (status: Meeting['status']): JSX.Element => {
//         let style: ViewStyle[] = [globalStyles.badge];
//         let textStyle: TextStyle[] = [globalStyles.badgeText];
//         switch (status) {
//             case 'Scheduled': style.push(globalStyles.badgeDefault as ViewStyle); textStyle.push(globalStyles.badgeDefaultText as TextStyle); break;
//             case 'Ongoing': style.push(globalStyles.badgeSecondary as ViewStyle); textStyle.push(globalStyles.badgeSecondaryText as TextStyle); break;
//             case 'Completed': style.push(globalStyles.badgeOutline as ViewStyle); textStyle.push(globalStyles.badgeOutlineText as TextStyle); break;
//             case 'Archived': style.push(globalStyles.badgeDestructive as ViewStyle); textStyle.push(globalStyles.badgeDestructiveText as TextStyle); break;
//         }
//         return (<View style={style}><Text style={textStyle}>{status}</Text></View>);
//     };

//     return (
//       <View style={globalStyles.card}>
//         <View style={styles.itemHeader}>
//           <Text style={styles.itemTitle}>{item.title}</Text>
//            {getStatusBadge(item.status)}
//         </View>
//         <Text style={styles.itemDetail}><Icon name="calendar" size={14} color={colors.muted} /> {dateTime}</Text>
//         <Text style={styles.itemDetail}><Icon name="clock-outline" size={14} color={colors.muted} /> {item.duration} mins</Text>
//         <Text style={styles.itemAgenda}>{item.agenda}</Text>
//         {item.instructions && <Text style={styles.itemDetailSmall}><Icon name="information-outline" size={14} color={colors.muted} /> {item.instructions}</Text>}
//         {item.documents && item.documents.length > 0 && (
//             <View style={{marginTop: spacing.xs}}>
//                 <Text style={styles.itemDetailSmall}><Icon name="paperclip" size={14} color={colors.muted} /> Documents:</Text>
//                 {item.documents.map((doc, idx) => <Text key={idx} style={[styles.itemDetailSmall, { marginLeft: spacing.md }]}>- {doc.name}</Text>)}
//             </View>
//         )}

//          <View style={styles.actionsContainer}>
//            {user?.role === 'Director' && item.status === 'Scheduled' && (
//                <TouchableOpacity onPress={() => handleStartMeeting(item)} style={styles.actionButton}>
//                    <Icon name="play-circle-outline" size={18} color={colors.primary} /><Text style={styles.actionText}>Start</Text>
//                </TouchableOpacity>
//            )}
//            {user?.role === 'Director' && item.status === 'Ongoing' && (
//                 <TouchableOpacity onPress={() => handleEndMeeting(item.id)} style={styles.actionButton}>
//                     <Icon name="stop-circle-outline" size={18} color={colors.destructive} /><Text style={[styles.actionText, {color: colors.destructive}]}>End</Text>
//                 </TouchableOpacity>
//            )}
//            {item.status !== 'Archived' && item.meetingLink && (
//                 <TouchableOpacity onPress={() => handleJoinMeeting(item)} style={styles.actionButton}>
//                     <Icon name="video-outline" size={18} color={colors.primary} /><Text style={styles.actionText}>Join</Text>
//                 </TouchableOpacity>
//             )}
//            {user?.role === 'Director' && item.status === 'Scheduled' && (
//                 <TouchableOpacity onPress={() => openScheduleModal(item)} style={styles.actionButton}>
//                      <Icon name="pencil-outline" size={18} color={colors.muted} /><Text style={[styles.actionText, {color: colors.muted}]}>Reschedule</Text>
//                 </TouchableOpacity>
//            )}
//            {(user?.role === 'Director' || user?.role === 'Chairman') && (item.status === 'Completed' || item.status === 'Scheduled') && (
//                 <TouchableOpacity onPress={() => handleArchiveMeeting(item.id)} style={styles.actionButton}>
//                      <Icon name="archive-arrow-down-outline" size={18} color={colors.muted} /><Text style={[styles.actionText, {color: colors.muted}]}>Archive</Text>
//                 </TouchableOpacity>
//            )}
//            {user?.role === 'Director' && item.status === 'Archived' && (
//                <TouchableOpacity onPress={() => Alert.alert('Confirm Delete', `Delete "${item.title}"? This cannot be undone.`, [{text: 'Cancel'}, {text: 'Delete', onPress: () => handleDeleteMeeting(item.id), style: 'destructive'}])} style={styles.actionButton}>
//                    <Icon name="trash-can-outline" size={18} color={colors.destructive} /><Text style={[styles.actionText, {color: colors.destructive}]}>Delete</Text>
//                </TouchableOpacity>
//            )}
//          </View>
//       </View>
//     );
//   };

//   const meetingsToDisplay = viewingArchived ? archivedMeetings : meetings;

//   return (
//     <View style={globalStyles.container}>
//       <Stack.Screen options={{ title: viewingArchived ? 'Archived Meetings' : 'Meetings' }} />
//       <View style={styles.headerContainer}>
//         <Text style={typography.h1}>{viewingArchived ? 'Archived Meetings' : 'Meetings'}</Text>
//         <View style={styles.headerActions}>
//             {(user?.role === 'Director' || user?.role === 'Chairman') && (
//                 <TouchableOpacity onPress={() => setViewingArchived(!viewingArchived)} style={styles.headerButton}>
//                     <Icon name={viewingArchived ? "calendar-check-outline" : "archive-arrow-down-outline"} size={20} color={colors.primary} />
//                     <Text style={styles.headerButtonText}>{viewingArchived ? "Active" : "Archived"}</Text>
//                 </TouchableOpacity>
//             )}
//             {user?.role === 'Director' && !viewingArchived && (
//                 <TouchableOpacity onPress={() => openScheduleModal(null)} style={[globalStyles.button, styles.scheduleButton]}>
//                 <Icon name="plus-circle-outline" size={20} color={colors.white} style={{marginRight: spacing.sm}}/>
//                 <Text style={globalStyles.buttonText}>Schedule</Text>
//                 </TouchableOpacity>
//             )}
//         </View>
//       </View>

//       {isLoading ? (
//         <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
//       ) : error ? (
//         <Text style={styles.errorText}>{error}</Text>
//       ) : meetingsToDisplay.length === 0 ? (
//           <View style={styles.emptyContainer}>
//               <Icon name={viewingArchived ? "archive-outline" : "calendar-remove-outline"} size={60} color={colors.muted} />
//               <Text style={typography.h3}>No {viewingArchived ? "Archived" : ""} Meetings Found</Text>
//               <Text style={typography.muted}>There are no {viewingArchived ? "archived" : "upcoming or relevant"} meetings.</Text>
//                {user?.role === 'Director' && !viewingArchived && (
//                  <TouchableOpacity style={[globalStyles.button, {marginTop: spacing.lg}]} onPress={() => openScheduleModal(null)}>
//                      <Icon name="plus-circle-outline" size={20} color={colors.white} style={{marginRight: spacing.sm}}/>
//                      <Text style={globalStyles.buttonText}>Schedule New Meeting</Text>
//                  </TouchableOpacity>
//                )}
//           </View>
//       ) : (
//         <FlatList
//           data={meetingsToDisplay}
//           renderItem={renderMeetingItem}
//           keyExtractor={(item) => item.id}
//           contentContainerStyle={{ paddingBottom: spacing.md }}
//           showsVerticalScrollIndicator={false}
//         />
//       )}
//       {/* Removed allUsers prop as it's fetched inside the modal via context */}
//       <ScheduleMeetingModal
//             visible={isModalVisible}
//             onClose={() => { setIsModalVisible(false); setEditingMeeting(null); }}
//             onSchedule={handleScheduleMeeting}
//             initialData={editingMeeting || undefined}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   headerContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: spacing.md,
//     paddingTop: spacing.sm,
//   },
//   headerActions: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flexShrink: 1,
//   },
//   headerButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: spacing.sm,
//     paddingVertical: spacing.xs,
//     marginLeft: spacing.sm,
//   },
//   headerButtonText: {
//       ...typography.body,
//       color: colors.primary,
//       fontWeight: '500',
//       marginLeft: spacing.xs,
//   },
//   scheduleButton: {
//     paddingVertical: spacing.sm,
//     paddingHorizontal: spacing.md,
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginLeft: spacing.sm,
//   },
//   itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
//   itemTitle: { fontSize: 18, fontWeight: 'bold', flexShrink: 1, marginRight: spacing.sm, color: colors.text },
//   itemDetail: { fontSize: 14, color: colors.muted, marginBottom: spacing.xs, flexDirection: 'row', alignItems: 'center' },
//   itemDetailSmall: { fontSize: 12, color: colors.muted, marginBottom: spacing.xs, flexDirection: 'row', alignItems: 'center' },
//   itemAgenda: { fontSize: 14, color: colors.text, marginTop: spacing.xs, marginBottom: spacing.md },
//   actionsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', gap: spacing.md, marginTop: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, paddingTop: spacing.sm },
//   actionButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.xs },
//   actionText: { marginLeft: spacing.xs, color: colors.primary, fontWeight: '500' },
//   emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg, marginTop: 50 },
//   errorText: { color: colors.destructive, textAlign: 'center', marginTop: 20 },
// });


import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Linking , ViewStyle, TextStyle } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import type { User, Meeting } from '@/types';
import { globalStyles, colors, spacing, typography } from '@/styles/globalStyles';
import { format, parse } from 'date-fns';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Stack, Redirect } from 'expo-router';
import ScheduleMeetingModal from '@/components/meetings/ScheduleMeetingModal';
import { createMeeting, startMeeting, endMeeting } from '@/services/video-conferencing';
import { sendNotification } from '@/services/notification';
import { databases} from '@/lib/appwrite';
import {Query} from 'appwrite';

const fetchMeetingsFromDB = async (user: User): Promise<Meeting[]> => {
  try {
    const queries = [
      Query.notEqual('status', 'Archived'),
      Query.equal('tenant', user.tenant)
    ];
    
    if (user.role === 'Delegate') {
      queries.push(Query.equal('attendees', user.id));
    }

    const response = await databases.listDocuments(
      'your-database-id',
      'meetings',
      queries
    );

    return response.documents.map(doc => ({
      id: doc.$id,
      date: new Date(doc.date),
      time: doc.time,
      duration: doc.duration,
      title: doc.title,
      agenda: doc.agenda,
      instructions: doc.instructions,
      status: doc.status,
      attendees: doc.attendees,
      invitedDelegates: doc.invitedDelegates,
      documents: doc.documents,
      meetingLink: doc.meetingLink,
      tenant: doc.tenant
    }));
  } catch (error) {
    console.error("Failed to fetch meetings:", error);
    throw error;
  }
};

const fetchArchivedMeetingsFromDB = async (tenant: string): Promise<Meeting[]> => {
  try {
    const response = await databases.listDocuments(
      'your-database-id',
      'meetings',
      [
        Query.equal('status', 'Archived'),
        Query.equal('tenant', tenant)
      ]
    );

    return response.documents.map(doc => ({
      id: doc.$id,
      date: new Date(doc.date),
      time: doc.time,
      duration: doc.duration,
      title: doc.title,
      agenda: doc.agenda,
      status: doc.status,
      attendees: doc.attendees,
      tenant: doc.tenant
    }));
  } catch (error) {
    console.error("Failed to fetch archived meetings:", error);
    throw error;
  }
};

export default function MeetingsScreen() {
  const { user, getChairman, fetchUsers } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [archivedMeetings, setArchivedMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [viewingArchived, setViewingArchived] = useState(false);


  const mapAppwriteToMeeting = (doc: any): Meeting => ({
    id: doc.$id,
    date: new Date(doc.date),
    time: doc.time,
    duration: doc.duration,
    title: doc.title,
    agenda: doc.agenda,
    instructions: doc.instructions,
    status: doc.status,
    attendees: doc.attendees || [],
    invitedDelegates: doc.invitedDelegates || [],
    documents: doc.documents || [],
    meetingLink: doc.meetingLink,
    tenant: doc.tenant
  });


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

  const handleScheduleMeeting = async (
    meetingData: Omit<Meeting, 'id' | 'status' | 'meetingLink' | 'attendees'> & { invitedDelegates: string[] }
  ): Promise<boolean> => {
    if (!user || user.role !== 'Director') return false;

    try {
      const chairman = await getChairman();
      let allAttendeeIds = new Set<string>(meetingData.invitedDelegates || []);
      if (chairman) allAttendeeIds.add(chairman.id);
      allAttendeeIds.add(user.id);

      const videoConfDetails = await createMeeting(meetingData.title, meetingData.date, meetingData.duration);

      const newMeeting = {
        ...meetingData,
        status: 'Scheduled',
        meetingLink: videoConfDetails.joinUrl,
        attendees: Array.from(allAttendeeIds),
        tenant: user.tenant
      };

      if (editingMeeting) {
        await databases.updateDocument(
          'your-database-id',
          'meetings',
          editingMeeting.id,
          newMeeting
        );
        setMeetings(prev => prev.map(m => 
          m.id === editingMeeting.id ? mapAppwriteToMeeting({
            ...m,
            ...newMeeting,
            $id: m.id, // Preserve the ID
            date: m.date.toISOString() // Convert back to ISO string for consistency
          }) : m
        ));
        Alert.alert('Meeting Updated', `${newMeeting.title} updated successfully.`);
      } else {
        const response = await databases.createDocument(
          'your-database-id',
          'meetings',
          'unique()',
          newMeeting
        );
        setMeetings(prev => [mapAppwriteToMeeting(response), ...prev]);
        Alert.alert('Meeting Scheduled', `${newMeeting.title} has been scheduled.`);
      }

      const allUsers = await fetchUsers(); // Fetch all users for notifications
            const invitedUsers = allUsers.filter(u => allAttendeeIds.has(u.id));
            for (const invited of invitedUsers) {
              if (invited.id !== user.id) {
                   await sendNotification({
                     recipient: invited.email,
                     subject: `Meeting Invitation: ${meetingData.title}`,
                     body: `You have been invited to the meeting "${meetingData.title}" on ${format(meetingData.date, 'PPP')} at ${meetingData.time}. Agenda: ${meetingData.agenda}`,
                   });
                   console.log(`RN Notification sent to ${invited.email} for meeting ${meetingData.title}`);
              }
            }
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
              // TODO: Update meeting status to 'Ongoing' in Appwrite
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
  
    const handleArchiveMeeting = (meetingId: string) => {
      if (!user || user.role === 'Delegate') return;
      // TODO: Update meeting status to 'Archived' in Appwrite
      setMeetings(prevMeetings => prevMeetings.filter(m => m.id !== meetingId));
      Alert.alert('Meeting Archived', 'The meeting has been archived.');
    };
  
    const handleDeleteMeeting = (meetingId: string) => {
      if (!user || user.role !== 'Director') return;
      // TODO: Delete meeting from Appwrite
      if (viewingArchived) {
          setArchivedMeetings(prev => prev.filter(m => m.id !== meetingId));
      } else {
          setMeetings(prev => prev.filter(m => m.id !== meetingId));
      }
       Alert.alert('Meeting Deleted', 'The meeting has been deleted.');
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
       const dateTime = `${format(new Date(item.date), 'PPP')} at ${format(parse(item.time, 'HH:mm', new Date()), 'p')}`;
  
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
                  <Text style={styles.itemDetailSmall}><Icon name="paperclip" size={14} color={colors.muted} /> Documents:</Text>
                  {item.documents.map((doc, idx) => <Text key={idx} style={[styles.itemDetailSmall, { marginLeft: spacing.md }]}>- {doc.name}</Text>)}
              </View>
          )}
  
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
  
    const meetingsToDisplay = viewingArchived ? archivedMeetings : meetings;
  
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
                <Text style={typography.h3}>No {viewingArchived ? "Archived" : ""} Meetings Found</Text>
                <Text style={typography.muted}>There are no {viewingArchived ? "archived" : "upcoming or relevant"} meetings.</Text>
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

 