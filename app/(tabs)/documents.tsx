
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '@/context/AuthContext'; // Adjust path
import type { User, DocumentItem } from '@/types'; // Adjust path
import { globalStyles, colors, spacing, typography } from '@/styles/globalStyles'; // Adjust path
import { format } from 'date-fns';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Stack } from 'expo-router';


const fetchDocuments = async (userRole: User['role']): Promise<DocumentItem[]> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const allDocs: DocumentItem[] = [
    { id: 'doc1', name: 'Q3 Financial Report.pdf', type: 'PDF', uploadedBy: 'Alice Smith (Delegate)', uploadDate: new Date(2024, 6, 20), status: 'Approved', fileUrl: '/documents/q3-financials.pdf', relatedMeeting: 'Budget Review Q3' },
    { id: 'doc2', name: 'Project Alpha Plan.docx', type: 'Word', uploadedBy: 'Bob Johnson (Delegate)', uploadDate: new Date(2024, 6, 22), status: 'Pending Approval', fileUrl: '/documents/project-alpha.docx', relatedMeeting: 'Project Alpha Kickoff' },
    { id: 'doc3', name: 'Marketing Strategy Q4.pptx', type: 'PowerPoint', uploadedBy: 'Charlie Brown (Delegate)', uploadDate: new Date(2024, 6, 15), status: 'Approved', fileUrl: '/documents/marketing-q4.pptx' },
  ];
    if (userRole === 'Delegate') {
        return allDocs.filter(doc => doc.status === 'Approved');
    }
    return allDocs;
};

export default function DocumentsScreen() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

   const loadDocuments = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const fetchedDocs = await fetchDocuments(user.role);
      setDocuments(fetchedDocs);
    } catch (err) {
      console.error("Failed to fetch documents:", err);
      setError("Could not load documents.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

   const handleActionPress = (document: DocumentItem, action: 'View' | 'Approve' | 'Reject' | 'Delete') => {
     if (action === 'Approve' || action === 'Reject' || action === 'Delete') {
        if(user?.role !== 'Director') {
            Alert.alert('Permission Denied', 'Only Directors can perform this action.');
            return;
        }
        if(action === 'Approve') setDocuments(docs => docs.map(d => d.id === document.id ? {...d, status: 'Approved'} : d));
        if(action === 'Reject') setDocuments(docs => docs.map(d => d.id === document.id ? {...d, status: 'Rejected'} : d));
        if(action === 'Delete') setDocuments(docs => docs.filter(d => d.id !== document.id));
     }
     Alert.alert('Action', `${action} document: ${document.name}`);
   };

   const getStatusBadge = (status: DocumentItem['status']) => {
        let style = [globalStyles.badge];
        let textStyle = [globalStyles.badgeText];
        switch (status) {
            case 'Approved': style.push(globalStyles.badgeDefault); textStyle.push(globalStyles.badgeDefaultText); break;
            case 'Pending Approval': style.push(globalStyles.badgeSecondary); textStyle.push(globalStyles.badgeSecondaryText); break;
            case 'Rejected': style.push(globalStyles.badgeDestructive); textStyle.push(globalStyles.badgeDestructiveText); break;
        }
        return (<View style={style}><Text style={textStyle}>{status}</Text></View>);
    };

  const renderDocumentItem = ({ item }: { item: DocumentItem }) => {
      const isDirector = user?.role === 'Director';
      return (
      <View style={globalStyles.card}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemTitle}>{item.name}</Text>
             {getStatusBadge(item.status)}
          </View>
          <Text style={styles.itemDetail}>Type: {item.type}</Text>
          <Text style={styles.itemDetail}>Uploaded by: {item.uploadedBy}</Text>
          <Text style={styles.itemDetail}>Date: {format(new Date(item.uploadDate), 'PPP')}</Text>
          {item.relatedMeeting && <Text style={styles.itemDetail}>Meeting: {item.relatedMeeting}</Text>}

          <View style={styles.actionsContainer}>
             <TouchableOpacity onPress={() => handleActionPress(item, 'View')} style={styles.actionButton}>
                <Icon name="eye-outline" size={18} color={colors.primary} /><Text style={styles.actionText}>View</Text>
             </TouchableOpacity>
            {isDirector && item.status === 'Pending Approval' && (
                <>
                    <TouchableOpacity onPress={() => handleActionPress(item, 'Approve')} style={styles.actionButton}>
                        <Icon name="check-circle-outline" size={18} color={colors.success} /><Text style={[styles.actionText, {color: colors.success}]}>Approve</Text>
                    </TouchableOpacity>
                     <TouchableOpacity onPress={() => handleActionPress(item, 'Reject')} style={styles.actionButton}>
                        <Icon name="close-circle-outline" size={18} color={colors.destructive} /><Text style={[styles.actionText, {color: colors.destructive}]}>Reject</Text>
                    </TouchableOpacity>
                </>
            )}
            {isDirector && (item.status === 'Rejected' || item.status === 'Pending Approval') && (
                 <TouchableOpacity onPress={() => handleActionPress(item, 'Delete')} style={styles.actionButton}>
                    <Icon name="trash-can-outline" size={18} color={colors.destructive} /><Text style={[styles.actionText, {color: colors.destructive}]}>Delete</Text>
                </TouchableOpacity>
            )}
          </View>
      </View>
    );
  };

  return (
    <View style={globalStyles.container}>
      <Stack.Screen options={{ title: 'Documents' }} />
      <Text style={typography.h1}>Documents</Text>
       {(user?.role === 'Delegate' || user?.role === 'Director') && (
            <TouchableOpacity
                style={[globalStyles.button, styles.uploadButton]}
                onPress={() => Alert.alert('Upload', 'Open Document Upload Modal/Screen')} >
                <Icon name="upload" size={20} color={colors.white} style={{marginRight: spacing.sm}} />
                <Text style={globalStyles.buttonText}>Upload Document</Text>
            </TouchableOpacity>
       )}
      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : documents.length === 0 ? (
           <View style={styles.emptyContainer}>
              <Icon name="file-multiple-outline" size={60} color={colors.muted} />
              <Text style={typography.h3}>No Documents Found</Text>
              <Text style={typography.muted}>There are no documents available for you.</Text>
           </View>
      ) : (
        <FlatList
          data={documents}
          renderItem={renderDocumentItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: spacing.md }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
   itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  itemTitle: { fontSize: 18, fontWeight: 'bold', flexShrink: 1, marginRight: spacing.sm },
  itemDetail: { fontSize: 14, color: colors.muted, marginBottom: spacing.xs },
  actionsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', gap: spacing.md, marginTop: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, paddingTop: spacing.sm },
  actionButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.xs },
  actionText: { marginLeft: spacing.xs, color: colors.primary, fontWeight: '500' },
  uploadButton: { marginBottom: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg, marginTop: 50 },
  errorText: { color: colors.destructive, textAlign: 'center', marginTop: 20 },
});
