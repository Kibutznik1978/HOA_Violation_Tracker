import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { HOA } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

const HOAManagement: React.FC = () => {
  const [hoas, setHoas] = useState<HOA[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingHoa, setEditingHoa] = useState<HOA | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'hoas'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const hoasData: HOA[] = [];
      querySnapshot.forEach((doc) => {
        hoasData.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate(),
          updatedAt: doc.data().updatedAt.toDate(),
        } as HOA);
      });
      setHoas(hoasData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddHoa = async (hoaData: Omit<HOA, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addDoc(collection(db, 'hoas'), {
        ...hoaData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding HOA:', error);
    }
  };

  const handleUpdateHoa = async (hoaId: string, updates: Partial<HOA>) => {
    try {
      await updateDoc(doc(db, 'hoas', hoaId), {
        ...updates,
        updatedAt: new Date(),
      });
      setEditingHoa(null);
    } catch (error) {
      console.error('Error updating HOA:', error);
    }
  };

  const handleDeleteHoa = async (hoaId: string) => {
    if (window.confirm('Are you sure you want to delete this HOA? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'hoas', hoaId));
      } catch (error) {
        console.error('Error deleting HOA:', error);
      }
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading HOAs...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">HOA Management</h2>
        <Button onClick={() => setShowAddForm(true)}>
          Add New HOA
        </Button>
      </div>

      {showAddForm && (
        <HOAForm
          onSubmit={handleAddHoa}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <div className="grid gap-6">
        {hoas.map((hoa) => (
          <div key={hoa.id} className="bg-card border rounded-lg p-6">
            {editingHoa?.id === hoa.id ? (
              <HOAForm
                hoa={editingHoa}
                onSubmit={(data) => handleUpdateHoa(hoa.id, data)}
                onCancel={() => setEditingHoa(null)}
              />
            ) : (
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{hoa.name}</h3>
                    <p className="text-sm text-muted-foreground">{hoa.address}</p>
                    <p className="text-sm text-muted-foreground">Admin: {hoa.adminEmail}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      hoa.subscriptionStatus === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {hoa.subscriptionStatus.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-muted-foreground">
                    Additional Emails: {hoa.additionalEmails.join(', ') || 'None'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Violation Types: {hoa.violationTypes.join(', ')}
                  </p>
                </div>

                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setEditingHoa(hoa)}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDeleteHoa(hoa.id)}
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

interface HOAFormProps {
  hoa?: HOA;
  onSubmit: (data: Omit<HOA, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const HOAForm: React.FC<HOAFormProps> = ({ hoa, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: hoa?.name || '',
    address: hoa?.address || '',
    adminEmail: hoa?.adminEmail || '',
    additionalEmails: hoa?.additionalEmails.join(', ') || '',
    subscriptionStatus: hoa?.subscriptionStatus || 'pending' as const,
    violationTypes: hoa?.violationTypes.join(', ') || 'Parking Violation, Landscaping/Maintenance, Noise Complaint, Pet Violation, Architectural Violation, Trash/Recycling, Pool/Amenity Rules, Other',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      address: formData.address,
      adminEmail: formData.adminEmail,
      additionalEmails: formData.additionalEmails
        .split(',')
        .map(email => email.trim())
        .filter(email => email),
      subscriptionStatus: formData.subscriptionStatus,
      violationTypes: formData.violationTypes
        .split(',')
        .map(type => type.trim())
        .filter(type => type),
    });
  };

  return (
    <div className="bg-muted p-6 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">
        {hoa ? 'Edit HOA' : 'Add New HOA'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">HOA Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="address">Address *</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="adminEmail">Admin Email *</Label>
          <Input
            id="adminEmail"
            type="email"
            value={formData.adminEmail}
            onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="additionalEmails">Additional Emails (comma-separated)</Label>
          <Input
            id="additionalEmails"
            value={formData.additionalEmails}
            onChange={(e) => setFormData({ ...formData, additionalEmails: e.target.value })}
            placeholder="email1@example.com, email2@example.com"
          />
        </div>

        <div>
          <Label htmlFor="subscriptionStatus">Subscription Status</Label>
          <Select
            id="subscriptionStatus"
            value={formData.subscriptionStatus}
            onChange={(e) => setFormData({ ...formData, subscriptionStatus: e.target.value as any })}
          >
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        </div>

        <div>
          <Label htmlFor="violationTypes">Violation Types (comma-separated)</Label>
          <Textarea
            id="violationTypes"
            value={formData.violationTypes}
            onChange={(e) => setFormData({ ...formData, violationTypes: e.target.value })}
            rows={3}
          />
        </div>

        <div className="flex space-x-2">
          <Button type="submit">
            {hoa ? 'Update HOA' : 'Add HOA'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default HOAManagement;