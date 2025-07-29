import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, updateDoc, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../firebase/config';
import { User } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Label } from '../ui/label';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [hoas, setHoas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    // Load users
    const usersQuery = query(collection(db, 'users'));
    const unsubscribeUsers = onSnapshot(usersQuery, (querySnapshot) => {
      const usersData: User[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        usersData.push({
          id: doc.id,
          ...data,
        } as User);
      });
      setUsers(usersData);
    });

    // Load HOAs for the dropdown
    const hoasQuery = query(collection(db, 'hoas'));
    const unsubscribeHoas = onSnapshot(hoasQuery, (querySnapshot) => {
      const hoasData: any[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        hoasData.push({
          id: doc.id,
          ...data,
        });
      });
      setHoas(hoasData);
      setLoading(false);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeHoas();
    };
  }, []);

  const handleAddUser = async (userData: { email: string; password: string; role: string; hoaId?: string }) => {
    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      const uid = userCredential.user.uid;
      
      console.log('🔍 UserManagement - Created auth user with UID:', uid);

      // Create user document in Firestore with the auth UID as document ID
      const userDoc = {
        email: userData.email,
        role: userData.role as 'hoa_admin' | 'super_admin',
        hoaId: userData.role === 'hoa_admin' ? userData.hoaId : undefined,
      };

      // Use setDoc with the UID as the document ID instead of addDoc
      await setDoc(doc(db, 'users', uid), userDoc);
      console.log('🔍 UserManagement - Created user document with UID:', uid, userDoc);
      
      setShowAddForm(false);
      alert('User created successfully!');
    } catch (error: any) {
      console.error('Error adding user:', error);
      if (error.code === 'auth/email-already-in-use') {
        alert('This email is already in use. Please choose a different email.');
      } else {
        alert(`Error creating user: ${error.message}`);
      }
    }
  };

  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    try {
      await updateDoc(doc(db, 'users', userId), updates);
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'users', userId));
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">User Management</h2>
        <Button onClick={() => setShowAddForm(true)}>
          Add New User
        </Button>
      </div>

      {showAddForm && (
        <UserForm
          hoas={hoas}
          onSubmit={handleAddUser}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <div className="grid gap-4">
        {users.map((user) => (
          <div key={user.id} className="bg-card border rounded-lg p-6">
            {editingUser?.id === user.id ? (
              <UserForm
                user={editingUser}
                hoas={hoas}
                onSubmit={(data) => handleUpdateUser(user.id, data)}
                onCancel={() => setEditingUser(null)}
                isEditing
              />
            ) : (
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{user.email}</h3>
                    <p className="text-sm text-muted-foreground">Role: {user.role.replace('_', ' ').toUpperCase()}</p>
                    {user.hoaId && (
                      <p className="text-sm text-muted-foreground">HOA: {user.hoaId}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'super_admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setEditingUser(user)}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

interface UserFormProps {
  user?: User;
  hoas: any[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({ user, hoas, onSubmit, onCancel, isEditing = false }) => {
  const [formData, setFormData] = useState({
    email: user?.email || '',
    password: '',
    role: user?.role || 'hoa_admin',
    hoaId: user?.hoaId || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isEditing && !formData.password) {
      alert('Password is required for new users');
      return;
    }

    if (formData.role === 'hoa_admin' && !formData.hoaId) {
      alert('HOA selection is required for HOA admins');
      return;
    }

    const submitData = isEditing 
      ? { role: formData.role, hoaId: formData.role === 'hoa_admin' ? formData.hoaId : undefined }
      : formData;

    onSubmit(submitData);
  };

  return (
    <div className="bg-muted p-6 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">
        {isEditing ? 'Edit User' : 'Add New User'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            disabled={isEditing}
          />
        </div>

        {!isEditing && (
          <div>
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={6}
            />
          </div>
        )}

        <div>
          <Label htmlFor="role">Role *</Label>
          <Select
            id="role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as 'hoa_admin' | 'super_admin' })}
          >
            <option value="hoa_admin">HOA Admin</option>
            <option value="super_admin">Super Admin</option>
          </Select>
        </div>

        {formData.role === 'hoa_admin' && (
          <div>
            <Label htmlFor="hoaId">HOA *</Label>
            <Select
              id="hoaId"
              value={formData.hoaId}
              onChange={(e) => setFormData({ ...formData, hoaId: e.target.value })}
              required
            >
              <option value="">Select HOA</option>
              {hoas.map((hoa) => (
                <option key={hoa.id} value={hoa.id}>
                  {hoa.name}
                </option>
              ))}
            </Select>
          </div>
        )}

        <div className="flex space-x-2">
          <Button type="submit">
            {isEditing ? 'Update User' : 'Add User'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UserManagement;