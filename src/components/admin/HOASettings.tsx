import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { HOA } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

interface HOASettingsProps {
  hoaId: string;
}

const HOASettings: React.FC<HOASettingsProps> = ({ hoaId }) => {
  const [hoa, setHoa] = useState<HOA | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  
  const [settings, setSettings] = useState({
    name: '',
    address: '',
    adminEmail: '',
    additionalEmails: [] as string[],
    violationTypes: [] as string[],
  });

  useEffect(() => {
    const loadHOA = async () => {
      try {
        const hoaDoc = await getDoc(doc(db, 'hoas', hoaId));
        if (hoaDoc.exists()) {
          const hoaData = { id: hoaDoc.id, ...hoaDoc.data() } as HOA;
          setHoa(hoaData);
          setSettings({
            name: hoaData.name,
            address: hoaData.address,
            adminEmail: hoaData.adminEmail,
            additionalEmails: hoaData.additionalEmails || [],
            violationTypes: hoaData.violationTypes || [],
          });
        }
      } catch (error) {
        console.error('Error loading HOA:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHOA();
  }, [hoaId]);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'hoas', hoaId), {
        name: settings.name,
        address: settings.address,
        adminEmail: settings.adminEmail,
        additionalEmails: settings.additionalEmails,
        violationTypes: settings.violationTypes,
        updatedAt: new Date(),
      });
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddEmail = () => {
    if (newEmail && !settings.additionalEmails.includes(newEmail)) {
      setSettings({
        ...settings,
        additionalEmails: [...settings.additionalEmails, newEmail]
      });
      setNewEmail('');
    }
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setSettings({
      ...settings,
      additionalEmails: settings.additionalEmails.filter(email => email !== emailToRemove)
    });
  };

  const handleViolationTypesChange = (value: string) => {
    const types = value.split(',').map(type => type.trim()).filter(type => type);
    setSettings({ ...settings, violationTypes: types });
  };

  if (loading) {
    return <div className="text-center py-8">Loading HOA settings...</div>;
  }

  if (!hoa) {
    return <div className="text-center py-8">HOA not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-4">HOA Settings</h2>
        <p className="text-muted-foreground mb-6">
          Manage your HOA information and notification settings.
        </p>
      </div>

      <div className="bg-card rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="name">HOA Name *</Label>
            <Input
              id="name"
              value={settings.name}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              placeholder="Enter HOA name"
            />
          </div>

          <div>
            <Label htmlFor="adminEmail">Primary Admin Email *</Label>
            <Input
              id="adminEmail"
              type="email"
              value={settings.adminEmail}
              onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
              placeholder="admin@hoa.com"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="address">HOA Address *</Label>
          <Input
            id="address"
            value={settings.address}
            onChange={(e) => setSettings({ ...settings, address: e.target.value })}
            placeholder="123 Main Street, City, State 12345"
          />
        </div>

        <div>
          <Label>Additional Admin Emails</Label>
          <p className="text-sm text-muted-foreground mb-3">
            These emails will receive copies of all violation notifications.
          </p>
          
          <div className="flex gap-2 mb-3">
            <Input
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="additional@email.com"
              type="email"
            />
            <Button onClick={handleAddEmail} disabled={!newEmail}>
              Add Email
            </Button>
          </div>

          {settings.additionalEmails.length > 0 && (
            <div className="space-y-2">
              {settings.additionalEmails.map((email, index) => (
                <div key={index} className="flex items-center justify-between bg-muted p-3 rounded">
                  <span className="text-sm">{email}</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveEmail(email)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="violationTypes">Violation Types</Label>
          <p className="text-sm text-muted-foreground mb-2">
            Enter violation types separated by commas. These will appear in the dropdown for residents.
          </p>
          <Textarea
            id="violationTypes"
            value={settings.violationTypes.join(', ')}
            onChange={(e) => handleViolationTypesChange(e.target.value)}
            placeholder="Parking Violation, Landscaping/Maintenance, Noise Complaint, Pet Violation"
            rows={4}
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSaveSettings} disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">HOA Public Page</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Your HOA's public violation submission page:
            </p>
            <p className="text-sm font-medium text-primary">
              <a href={`/${hoaId}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {window.location.origin}/{hoaId}
              </a>
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigator.clipboard.writeText(`${window.location.origin}/${hoaId}`)}
          >
            Copy URL
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Subscription Status</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Current Status: 
              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                hoa.subscriptionStatus === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {hoa.subscriptionStatus.toUpperCase()}
              </span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Monthly subscription: $29.99/month
            </p>
          </div>
          {hoa.subscriptionStatus !== 'active' && (
            <Button variant="outline">
              Manage Subscription
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HOASettings;