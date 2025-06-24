
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Dimensions } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { globalStyles, colors, spacing, typography } from '@/styles/globalStyles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Stack, useRouter, Redirect } from 'expo-router';
import { databases} from '@/lib/appwrite';
import { Query } from "appwrite";

const { width } = Dimensions.get('window');
const CARD_GAP = spacing.md;
const CARD_WIDTH = (width - (spacing.lg * 2) - CARD_GAP) / 2;

const fetchTenantDashboardData = async (tenant: string) => {
  try {
    // Fetch tenant-specific meetings (filter by tenant)
    const [scheduledMeetings, completedMeetings, activeUsers, inactiveUsers, recentDocs] = await Promise.all([
      // Scheduled meetings for tenant
      databases.listDocuments(
      '6848228c00222dfaf82e',
      '685a245d0014fa92ce37',
        [
          Query.equal('status', 'Scheduled'),
          Query.equal('tenant', tenant)
        ]
      ),
      // Completed meetings for tenant
      databases.listDocuments(
      '6848228c00222dfaf82e',
      '685a245d0014fa92ce37',
        [
          Query.equal('status', 'Completed'),
          Query.equal('tenant', tenant)
        ]
      ),
      // Active users for tenant
      databases.listDocuments(
      '6848228c00222dfaf82e',
      '68597845003de1b5dcc0',
        [
          Query.equal('status', 'Active'),
          Query.equal('tenant', tenant)
        ]
      ),
      // Inactive users for tenant
      databases.listDocuments(
      '6848228c00222dfaf82e',
      '68597845003de1b5dcc0',
        [
          Query.equal('status', 'Inactive'),
          Query.equal('tenant', tenant)
        ]
      ),
      // Recent documents for tenant (last 7 days)
      databases.listDocuments(
      '6848228c00222dfaf82e',
      '685a245d0014fa92ce37',
        [
          Query.equal('tenant', tenant),
          Query.isNotNull('documents'),
          Query.greaterThan('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        ]
      )
    ]);

    return {
      scheduledMeetings: scheduledMeetings.total,
      activeUsers: activeUsers.total,
      inactiveMembers: inactiveUsers.total,
      meetingsHeld: completedMeetings.total,
      recentDocuments: recentDocs.documents.reduce(
        (total, meeting) => total + (meeting.documents?.length || 0), 
        0
      ),
    };
  } catch (error) {
    console.error("Error fetching tenant dashboard data:", error);
    throw error;
  }
};

export default function DashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user && ['Chairman', 'Director'].includes(user.role);
  const userTenant = user?.tenant; // Get tenant from user object

  useEffect(() => {
    if (!isAdmin && user) {
      router.replace('/(tabs)/meetings');
      return;
    }

    if (isAdmin && userTenant) {
      setIsLoading(true);
      setError(null);
      fetchTenantDashboardData(userTenant)
        .then(data => setDashboardData(data))
        .catch(err => {
          console.error("Failed to fetch dashboard data:", err);
          setError("Could not load dashboard data.");
        })
        .finally(() => setIsLoading(false));
    } else if (!user) {
      setIsLoading(false);
    }
  }, [isAdmin, user, router, userTenant]);

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!isAdmin) {
    return (
      <View style={globalStyles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={typography.muted}>Redirecting...</Text>
      </View>
    );
  }

  const renderAdminDashboard = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />;
    }
    if (error) {
      return <Text style={styles.errorText}>{error}</Text>;
    }
    if (!dashboardData) {
      return <Text style={typography.muted}>No dashboard data available for {userTenant}.</Text>;
    }

    return (
      <View style={styles.gridContainer}>
        <Text style={styles.tenantHeader}> Dashboard</Text>
        <View style={styles.gridRow}>
          <DashboardCard
            title="Scheduled Meetings"
            value={dashboardData.scheduledMeetings}
            icon="calendar-clock"
            description={`Upcoming meetings`}
          />
          <DashboardCard
            title="Active Members"
            value={dashboardData.activeUsers}
            icon="account-group"
            description={`Active members`}
          />
        </View>
        <View style={styles.gridRow}>
          <DashboardCard
            title="Meetings Held"
            value={dashboardData.meetingsHeld}
            icon="chart-bar"
            description={`Meetings concluded`}
          />
          <DashboardCard
            title="Inactive Members"
            value={dashboardData.inactiveMembers}
            icon="account-off"
            description={`Inactive users`}
          />
        </View>
        <View style={styles.gridRow}>
          <DashboardCard
            title="Recent Documents"
            value={dashboardData.recentDocuments}
            icon="file-document-outline"
            description={`Docs uploaded recently`}
          />
          <View style={styles.emptyCard} />
        </View>
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: `${userTenant} Dashboard` }} />
      {renderAdminDashboard()}
    </ScrollView>
  );
}


const DashboardCard = ({ title, value, icon, description }: { title: string, value: number | string, icon: string, description: string }) => (
  <View style={[styles.card, { width: CARD_WIDTH }]}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Icon name={icon} size={24} color={colors.primary} />
    </View>
    <Text style={styles.cardValue}>{value ?? 'N/A'}</Text>
    <Text style={styles.cardDescription}>{description}</Text>
  </View>
);




const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  loader: {
    marginTop: spacing.xl,
  },
  errorText: {
    color: colors.destructive,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  gridContainer: {
    flexDirection: 'column',
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: CARD_GAP,
  },
  card: {
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.card,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyCard: {
    width: CARD_WIDTH,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  cardDescription: {
    fontSize: 14,
    color: colors.muted,
    lineHeight: 18,
  },

  tenantHeader: {
    ...typography.h2,
    marginBottom: spacing.lg,
    textAlign: 'center',
    color: colors.primary,
  },
});