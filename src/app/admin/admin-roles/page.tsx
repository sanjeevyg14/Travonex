

/**
 * @fileoverview Admin Roles & Permissions Management Page
 *
 * @description
 * This page allows Superadmins to create and manage admin users and their roles,
 * enabling granular control over the admin panel's functionality.
 *
 * @developer_notes
 * - **State Management**: Uses `useState` and `react-hook-form` to manage roles, admins, and dialog states.
 * - **API Integration**:
 *   - `GET /api/admin/roles`, `GET /api/admin/users` to fetch initial data.
 *   - `POST /api/admin/roles`: Create a new role with permissions.
 *   - `PUT /api/admin/roles/{roleId}`: Update an existing role's name or permissions.
 *   - `DELETE /api/admin/roles/{roleId}`: Delete a role. Ensure it's not currently assigned to any admin.
 *   - `POST /api/admin/users`: Create a new admin user.
 *   - `PUT /api/admin/users/{userId}`: Update an admin user (status, role).
 */
"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PlusCircle, Shield, UserCog, Edit, MoreVertical, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { adminUsers, organizers as mockOrganizers } from "@/lib/mock-data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { AdminUser } from "@/lib/types";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ClientOnlyDate } from "@/components/common/ClientOnlyDate";


// BACKEND: This configuration should be fetched from the backend to dynamically build the permissions matrix.
const permissionsConfig = [
    { module: 'Dashboard', permissions: ['View'] },
    { module: 'Bookings', permissions: ['View', 'Edit', 'Cancel'] },
    { module: 'Trips', permissions: ['View', 'Approve/Reject', 'Edit'] },
    { module: 'Organisers', permissions: ['View', 'Approve/Reject KYC'] },
    { module: 'Revenue', permissions: ['View', 'Export'] },
    { module: 'Payouts', permissions: ['View', 'Process Payouts'] },
    { module: 'Refunds', permissions: ['View', 'Process Refunds'] },
    { module: 'Users', permissions: ['View', 'Edit', 'Suspend'] },
    { module: 'Settings', permissions: ['View', 'Edit'] },
    { module: 'Admin Roles', permissions: ['View', 'Create', 'Edit', 'Delete'] },
];

const mockRoles = [
    { id: 'superadmin', name: 'Super Admin', permissions: {} },
    { id: 'finance', name: 'Finance Manager', permissions: { Payouts: ['View', 'Process Payouts'], Refunds: ['View', 'Process Refunds'], Revenue: ['View', 'Export'] } },
    { id: 'support', name: 'Support Agent', permissions: { Bookings: ['View'], Users: ['View'], Disputes: ['View'] } },
    { id: 'ops', name: 'Operations Manager', permissions: { Trips: ['View', 'Approve/Reject', 'Edit'], Organisers: ['View', 'Approve/Reject KYC']} },
];

type Role = typeof mockRoles[0];

const RoleFormSchema = z.object({
  name: z.string().min(3, "Role name must be at least 3 characters."),
  description: z.string().optional(),
  permissions: z.record(z.array(z.string())).optional(),
});

type RoleFormData = z.infer<typeof RoleFormSchema>;

// BACKEND: The backend should enforce password complexity rules.
const AdminUserFormSchema = z.object({
  name: z.string().min(3, "Full name is required."),
  email: z.string().email("Please enter a valid email address."),
  role: z.string({ required_error: "Please assign a role." }),
  status: z.enum(['Active', 'Inactive']),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

type AdminUserFormData = z.infer<typeof AdminUserFormSchema>;


export default function AdminRolesPage() {
    const { toast } = useToast();
    const [roles, setRoles] = React.useState<Role[]>(mockRoles);
    const [admins, setAdmins] = React.useState<AdminUser[]>(adminUsers);
    const [selectedRole, setSelectedRole] = React.useState<Role | null>(null);
    const [permissions, setPermissions] = React.useState<Record<string, string[]>>({});
    const [isRoleDialogOpen, setIsRoleDialogOpen] = React.useState(false);
    const [isAdminDialogOpen, setIsAdminDialogOpen] = React.useState(false);
    const [editingRole, setEditingRole] = React.useState<Role | null>(null);
    const [isSaving, setIsSaving] = React.useState(false);

    const roleForm = useForm<RoleFormData>({
        resolver: zodResolver(RoleFormSchema),
    });
    
    const adminForm = useForm<AdminUserFormData>({
        resolver: zodResolver(AdminUserFormSchema),
        defaultValues: { status: 'Active' }
    });

    const handleRoleSelect = (role: Role) => {
        setSelectedRole(role);
        setPermissions((role.permissions ?? {}) as Record<string, string[]>);
    };

    const handlePermissionChange = (module: string, permission: string, checked: boolean) => {
        setPermissions(prev => {
            const newPermissions = { ...prev };
            if (checked) {
                newPermissions[module] = [...(newPermissions[module] || []), permission];
            } else {
                newPermissions[module] = (newPermissions[module] || []).filter(p => p !== permission);
            }
            return newPermissions;
        });
    };
    
    const handleSaveChanges = async () => {
        if (!selectedRole) return;
        setIsSaving(true);
        // BACKEND: Call `PUT /api/admin/roles/{selectedRole.id}` with the updated permissions object.
        await new Promise(resolve => setTimeout(resolve, 300));
        console.log("Saving permissions for role:", selectedRole.id, permissions);
        const updatedRoles = roles.map(r => r.id === selectedRole.id ? { ...r, permissions } : r);
        setRoles(updatedRoles);
        toast({
            title: "Permissions Saved",
            description: `Permissions for the ${selectedRole.name} role have been updated.`,
        });
        setIsSaving(false);
    };
    
    const handleAddNewRole = () => {
        setEditingRole(null);
        roleForm.reset({ name: '', description: '', permissions: {} });
        setIsRoleDialogOpen(true);
    };
    
    const handleEditRole = (role: Role) => {
        setEditingRole(role);
        roleForm.reset({ name: role.name, permissions: role.permissions });
        setIsRoleDialogOpen(true);
    };

    const handleRoleFormSubmit = async (data: RoleFormData) => {
        setIsSaving(true);
        // BACKEND: This is where you would call the API to create/update a role.
        // POST /api/admin/roles or PUT /api/admin/roles/{id}
        await new Promise(resolve => setTimeout(resolve, 300));
        if (editingRole) {
            const updatedRole = { ...editingRole, name: data.name, permissions: data.permissions || {} };
            setRoles(roles.map(r => r.id === editingRole.id ? updatedRole : r));
            toast({ title: "Role Updated", description: `The role "${data.name}" has been updated.` });
        } else {
             const newRole = {
                id: `role_${Date.now()}`,
                name: data.name,
                permissions: data.permissions || {},
            };
            setRoles([...roles, newRole]);
            toast({ title: "Role Created", description: `The new role "${data.name}" has been created.` });
        }
        setIsRoleDialogOpen(false);
        setEditingRole(null);
        setIsSaving(false);
    };
    
    const handleDeleteRole = (roleId: string) => {
        // BACKEND: Call `DELETE /api/admin/roles/{roleId}`
        // The backend should check if any admins are currently assigned this role before deleting.
        setRoles(roles.filter(r => r.id !== roleId));
        if (selectedRole?.id === roleId) {
            setSelectedRole(null);
            setPermissions({});
        }
        toast({ title: "Role Deleted" });
    }

    const handleAdminFormSubmit = async (data: AdminUserFormData) => {
        setIsSaving(true);
        // BACKEND: Call POST /api/admin/users to create a new admin.
        // The backend should hash the password before saving.
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const roleObj = roles.find(r => r.id === data.role);
        const newAdmin: AdminUser = {
            id: `ADM${Math.floor(Math.random() * 900) + 100}`,
            name: data.name,
            email: data.email,
            role: roleObj?.name as AdminUser['role'] || 'Support Agent', // Find role name from ID
            status: data.status,
            lastLogin: 'Never',
        };
        console.log("Creating new admin user:", newAdmin);
        setAdmins(prev => [...prev, newAdmin]);
        toast({ title: "Admin Created", description: `New admin "${data.name}" has been created.` });
        setIsAdminDialogOpen(false);
        setIsSaving(false);
    };

    const getStatusBadgeClass = (status: AdminUser['status']) => {
        switch (status) {
            case 'Active': return 'bg-green-600';
            case 'Inactive': return 'bg-slate-500';
            case 'Suspended': return 'bg-red-600';
        }
    }


  return (
    <>
    <main className="flex flex-1 flex-col gap-8 p-4 md:gap-8 md:p-8">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">
          Admin Access & Roles
        </h1>
        <p className="text-lg text-muted-foreground">
          Create sub-admins and manage role-based permissions for the admin panel.
        </p>
      </div>

       <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Manage Admin Accounts</CardTitle>
                    <CardDescription>Create, edit, and manage admin users.</CardDescription>
                </div>
                <Button onClick={() => setIsAdminDialogOpen(true)}><PlusCircle className="mr-2"/> Create Admin</Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email (Login ID)</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Last Login</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {admins.map(admin => (
                            <TableRow key={admin.id}>
                                <TableCell className="font-medium">{admin.name}</TableCell>
                                <TableCell>{admin.email}</TableCell>
                                <TableCell>{admin.role}</TableCell>
                                <TableCell><Badge className={getStatusBadgeClass(admin.status)}>{admin.status}</Badge></TableCell>
                                <TableCell>
                                    <ClientOnlyDate dateString={admin.lastLogin === 'Never' ? '' : admin.lastLogin} />
                                    {admin.lastLogin === 'Never' && 'Never'}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4"/></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem>Edit Role</DropdownMenuItem>
                                            <DropdownMenuItem>Reset Password</DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive">Suspend</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
            <CardFooter className="border-t pt-4">
                <p className="text-xs text-muted-foreground">Pagination controls would go here.</p>
            </CardFooter>
        </Card>

      <div className="grid md:grid-cols-3 gap-8 items-start">
        <Card className="md:col-span-1">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Roles</span>
                    <Button variant="ghost" size="icon" onClick={handleAddNewRole}><PlusCircle className="h-5 w-5"/></Button>
                </CardTitle>
                <CardDescription>Select a role to manage its permissions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                {roles.map(role => (
                    <button 
                        key={role.id} 
                        onClick={() => handleRoleSelect(role)}
                        className={`w-full text-left p-3 rounded-md flex items-center justify-between transition-colors ${selectedRole?.id === role.id ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-muted/50'}`}
                        disabled={role.id === 'superadmin'}
                    >
                        <div className="flex items-center gap-3">
                            <UserCog className="h-5 w-5" />
                            <span>{role.name}</span>
                        </div>
                         {role.id === 'superadmin' && <Shield className="h-5 w-5 text-green-600"/>}
                    </button>
                ))}
            </CardContent>
        </Card>

        <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
                <div>
                    <CardTitle>Permissions for {selectedRole?.name || "..."}</CardTitle>
                    <CardDescription>
                        {selectedRole ? (
                             selectedRole.id === 'superadmin' 
                            ? 'Super Admins have unrestricted access to all modules.'
                            : 'Select the permissions for this role. Changes are saved per role.'
                        ) : 'Select a role from the left to view its permissions.'}
                    </CardDescription>
                </div>
                 {selectedRole && selectedRole.id !== 'superadmin' && (
                    <Button variant="outline" size="sm" onClick={() => handleEditRole(selectedRole)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit Role
                    </Button>
                )}
            </CardHeader>
            {selectedRole ? (
                 <CardContent className="space-y-6">
                    {permissionsConfig.map(config => (
                        <div key={config.module}>
                            <h3 className="font-semibold mb-3">{config.module}</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pl-4">
                                {config.permissions.map(permission => {
                                    const isChecked = selectedRole?.id === 'superadmin' || permissions[config.module]?.includes(permission);
                                    return (
                                        <div key={permission} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`${config.module}-${permission}`}
                                                checked={isChecked}
                                                onCheckedChange={(checked) => handlePermissionChange(config.module, permission, !!checked)}
                                                disabled={selectedRole?.id === 'superadmin'}
                                            />
                                            <Label htmlFor={`${config.module}-${permission}`} className="text-sm font-normal">
                                                {permission}
                                            </Label>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </CardContent>
            ) : (
                <CardContent className="h-48 flex items-center justify-center text-muted-foreground">
                    <p>Select a role from the list to manage its permissions.</p>
                </CardContent>
            )}
            {selectedRole && selectedRole.id !== 'superadmin' && (
                <CardFooter className="border-t pt-6 flex justify-between">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive"><Trash2 className="mr-2"/> Delete Role</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the "{selectedRole.name}" role.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteRole(selectedRole.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    
                    <Button onClick={handleSaveChanges} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </CardFooter>
            )}
        </Card>
      </div>
    </main>

    <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{editingRole ? 'Edit Role' : 'Create New Role'}</DialogTitle>
                <DialogDescription>
                    Define the role name and assign permissions.
                </DialogDescription>
            </DialogHeader>
            <Form {...roleForm}>
                <form onSubmit={roleForm.handleSubmit(handleRoleFormSubmit)} className="space-y-6 py-4">
                    <FormField control={roleForm.control} name="name" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Role Name</FormLabel>
                            <FormControl><Input placeholder="e.g., Finance Manager" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <div>
                        <FormLabel>Permissions</FormLabel>
                        <Controller
                            control={roleForm.control}
                            name="permissions"
                            render={({ field }) => (
                                <div className="space-y-4 mt-2 max-h-60 overflow-y-auto pr-2 rounded-lg border p-4">
                                    {permissionsConfig.map(config => (
                                        <div key={config.module}>
                                            <h4 className="font-semibold mb-2">{config.module}</h4>
                                            <div className="grid grid-cols-3 gap-3 pl-2">
                                                {config.permissions.map(p => (
                                                    <div key={p} className="flex items-center gap-2">
                                                        <Checkbox
                                                            id={`form-${config.module}-${p}`}
                                                            onCheckedChange={(checked) => {
                                                                const currentPermissions = field.value || {};
                                                                const modulePermissions = currentPermissions[config.module] || [];
                                                                const newModulePermissions = checked ? [...modulePermissions, p] : modulePermissions.filter(perm => perm !== p);
                                                                field.onChange({ ...currentPermissions, [config.module]: newModulePermissions });
                                                            }}
                                                            checked={field.value?.[config.module]?.includes(p) || false}
                                                        />
                                                        <Label htmlFor={`form-${config.module}-${p}`} className="text-sm font-normal">{p}</Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsRoleDialogOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {editingRole ? 'Save Changes' : 'Create Role'}
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    </Dialog>

    <Dialog open={isAdminDialogOpen} onOpenChange={setIsAdminDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Create New Admin User</DialogTitle>
                <DialogDescription>Fill in the details to create a new administrative account.</DialogDescription>
            </DialogHeader>
            <Form {...adminForm}>
                <form onSubmit={adminForm.handleSubmit(handleAdminFormSubmit)} className="space-y-6 py-4">
                    <FormField control={adminForm.control} name="name" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="e.g., John Doe" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={adminForm.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email (Login ID)</FormLabel><FormControl><Input type="email" placeholder="e.g., john.doe@travonex.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={adminForm.control} name="password" render={({ field }) => (<FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={adminForm.control} name="role" render={({ field }) => (<FormItem><FormLabel>Role</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Assign a role..." /></SelectTrigger></FormControl><SelectContent>{roles.filter(r => r.id !== 'superadmin').map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                        <FormField control={adminForm.control} name="status" render={({ field }) => (<FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsAdminDialogOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Admin
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    </Dialog>
    </>
  );
}
