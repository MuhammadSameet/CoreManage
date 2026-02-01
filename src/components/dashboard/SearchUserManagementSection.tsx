import {
    SimpleGrid as MantineSimpleGrid,
    Text as MantineText,
    Loader as MantineLoader,
    Badge as MantineBadge,
    TextInput as MantineTextInput,
    Select as MantineSelect,
    Group as MantineGroup,
    ActionIcon as MantineActionIcon,
    Card as MantineCard
} from '@mantine/core';
import { StatsCard } from './StatsCard';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { useEffect, useState } from 'react';
import { fetchAllUsers, deleteUser } from '@/redux/actions/user-actions/user-actions';
import { IconSearch, IconFilter, IconTrash } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

const SimpleGrid = MantineSimpleGrid;
const TextInput = MantineTextInput;
const Select = MantineSelect;
const Group = MantineGroup;
const Text = MantineText;
const Loader = MantineLoader;
const Badge = MantineBadge;
const ActionIcon = MantineActionIcon;
const Card = MantineCard;

interface SearchUserManagementSectionProps {
  initialSearch?: string;
}

export function SearchUserManagementSection({ initialSearch = '' }: SearchUserManagementSectionProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { usersList, loading } = useSelector((state: RootState) => state.userStates);
    const [search, setSearch] = useState(initialSearch);
    const [statusFilter, setStatusFilter] = useState<string | null>('All');

    useEffect(() => {
        dispatch(fetchAllUsers());
    }, [dispatch]);

    // Filtering logic
    const filteredUsers = usersList.filter(user => {
        const matchesSearch = (user.name || '').toLowerCase().includes(search.toLowerCase()) ||
            (user.email || '').toLowerCase().includes(search.toLowerCase());

        // Mock status based on index for filtering demo
        const isPaid = usersList.indexOf(user) < Math.ceil(usersList.length / 2);
        const matchesStatus = statusFilter === 'All' ||
            (statusFilter === 'Paid' && isPaid) ||
            (statusFilter === 'Unpaid' && !isPaid);

        return matchesSearch && matchesStatus;
    });

    const paidUsers = filteredUsers.filter((_, i) => i < Math.ceil(filteredUsers.length / 2));
    const unpaidUsers = filteredUsers.filter((_, i) => i >= Math.ceil(filteredUsers.length / 2));

    const handleDeleteUser = async (docId: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete user ${name}?`)) {
            try {
                await dispatch(deleteUser(docId));
                notifications.show({
                    title: 'User Deleted',
                    message: `User ${name} has been successfully removed.`,
                    color: 'red'
                });
            } catch (_error: unknown) {
                notifications.show({
                    title: 'Error',
                    message: 'Failed to delete user.',
                    color: 'red'
                });
            }
        }
    };

    if (loading && usersList.length === 0) {
        return <div className="flex justify-center py-20"><Loader size="md" /></div>;
    }

    return (
        <div className="w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <Text className="text-xl font-bold text-gray-800">Search Results</Text>

                <Group gap="sm" className="w-full md:w-auto">
                    <TextInput
                        placeholder="Search by name or email..."
                        leftSection={<IconSearch size={16} />}
                        value={search}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                        className="flex-1 md:w-64"
                        radius="md"
                    />
                    <Select
                        placeholder="Status"
                        data={['All', 'Paid', 'Unpaid']}
                        value={statusFilter}
                        onChange={setStatusFilter}
                        leftSection={<IconFilter size={16} />}
                        className="w-32"
                        radius="md"
                    />
                </Group>
            </div>

            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
                <StatsCard
                    title="Total Results"
                    value={filteredUsers.length.toLocaleString()}
                    variant="blue"
                    action={{ label: "View All", onClick: () => window.location.href = '/users' }}
                />
                <StatsCard
                    title="Paid Users"
                    value={paidUsers.length.toLocaleString()}
                    variant="blue"
                    action={{ label: "View", onClick: () => window.location.href = '/users' }}
                />
                <StatsCard
                    title="Unpaid Users"
                    value={unpaidUsers.length.toLocaleString()}
                    variant="orange"
                    action={{ label: "View", onClick: () => window.location.href = '/users' }}
                />
            </SimpleGrid>

            {/* Results Area */}
            <div className="mt-8">
                {filteredUsers.length === 0 && search ? (
                    <Card className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
                        <Text className="text-gray-500 text-lg">No users found matching "{search}"</Text>
                        <Text className="text-gray-400 mt-2">Try adjusting your search terms</Text>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Paid Users List */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-6">
                                <Text className="font-bold text-gray-800 text-lg">Paid Users ({paidUsers.length})</Text>
                            </div>

                            {/* Header Row */}
                            <div className="flex text-[10px] uppercase font-bold text-gray-400 mb-2 px-2">
                                <span className="w-12">ID</span>
                                <span className="flex-1">Name</span>
                                <span className="flex-1">Email</span>
                                <span className="w-20 text-center">Actions</span>
                            </div>

                            {/* Table Rows */}
                            {paidUsers.length > 0 ? paidUsers.map((user, i) => (
                                <div key={user.uid || i} className="flex items-center py-3 px-2 border-b border-gray-50 last:border-0 text-xs transition-colors hover:bg-gray-50/50">
                                    <span className="text-gray-400 w-12 font-medium">0{i + 1}</span>
                                    <span className="text-gray-700 font-semibold flex-1 truncate pr-2">{user.name || 'No Name'}</span>
                                    <span className="text-gray-400 flex-1 truncate pr-2">{user.email}</span>
                                    <div className="w-20 flex justify-center gap-1">
                                        <Badge variant="light" color="green" radius="sm" className="font-bold text-[9px]">Paid</Badge>
                                        <ActionIcon
                                            variant="subtle"
                                            color="red"
                                            size="sm"
                                            onClick={() => handleDeleteUser(user.docId, user.name || user.email)}
                                        >
                                            <IconTrash size={14} />
                                        </ActionIcon>
                                    </div>
                                </div>
                            )) : <Text className="text-xs text-gray-400 p-4">No paid users found</Text>}
                        </div>

                        {/* Unpaid Users List */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-6">
                                <Text className="font-bold text-gray-800 text-lg">Unpaid Users ({unpaidUsers.length})</Text>
                            </div>

                            {/* Header Row */}
                            <div className="flex text-[10px] uppercase font-bold text-gray-400 mb-2 px-2">
                                <span className="w-12">ID</span>
                                <span className="flex-1">Name</span>
                                <span className="flex-1">Email</span>
                                <span className="w-20 text-center">Actions</span>
                            </div>

                            {/* Table Rows */}
                            {unpaidUsers.length > 0 ? unpaidUsers.map((user, i) => (
                                <div key={user.uid || i} className="flex items-center py-3 px-2 border-b border-gray-50 last:border-0 text-xs transition-colors hover:bg-gray-50/50">
                                    <span className="text-gray-400 w-12 font-medium">0{i + 1}</span>
                                    <span className="text-gray-700 font-semibold flex-1 truncate pr-2">{user.name || 'No Name'}</span>
                                    <span className="text-gray-400 flex-1 truncate pr-2">{user.email}</span>
                                    <div className="w-20 flex justify-center gap-1">
                                        <Badge variant="light" color="orange" radius="sm" className="font-bold text-[9px]">Unpaid</Badge>
                                        <ActionIcon
                                            variant="subtle"
                                            color="red"
                                            size="sm"
                                            onClick={() => handleDeleteUser(user.docId, user.name || user.email)}
                                        >
                                            <IconTrash size={14} />
                                        </ActionIcon>
                                    </div>
                                </div>
                            )) : <Text className="text-xs text-gray-400 p-4">No unpaid users found</Text>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}