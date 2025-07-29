import React, { useState } from 'react';
import { Violation } from '../../types';
import { Button } from '../ui/button';
import { Select } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { sendViolationNotificationToResident } from '../../utils/emailService';

interface ViolationCardProps {
  violation: Violation;
  onStatusUpdate: (id: string, status: Violation['status']) => void;
  onDelete: (id: string) => void;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  under_review: 'bg-blue-100 text-blue-800 border-blue-200',
  resolved: 'bg-green-100 text-green-800 border-green-200',
  dismissed: 'bg-gray-100 text-gray-800 border-gray-200',
};

const ViolationCard: React.FC<ViolationCardProps> = ({ violation, onStatusUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [adminNotes, setAdminNotes] = useState(violation.adminNotes || '');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailData, setEmailData] = useState({
    recipientEmail: '',
    subject: `Violation Notice - ${violation.type}`,
    message: `Dear Resident,\n\nA violation has been reported at ${violation.address}.\n\nViolation Type: ${violation.type}\nDescription: ${violation.description}\n\nPlease address this issue promptly.\n\nThank you,\nHOA Management`
  });

  const handleStatusChange = (status: Violation['status']) => {
    onStatusUpdate(violation.id, status);
  };

  const handleSaveNotes = async () => {
    try {
      await updateDoc(doc(db, 'violations', violation.id), {
        adminNotes,
        updatedAt: new Date(),
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating admin notes:', error);
    }
  };

  const handleSendEmail = async () => {
    try {
      await sendViolationNotificationToResident({
        violation,
        recipientEmail: emailData.recipientEmail,
        subject: emailData.subject,
        message: emailData.message
      });
      setShowEmailForm(false);
      alert('Email sent successfully!');
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Please try again.');
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="bg-card border rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{violation.type}</h3>
          <p className="text-sm text-muted-foreground">{violation.address}</p>
          <p className="text-sm text-muted-foreground">
            Reported: {formatDate(violation.createdAt)}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[violation.status]}`}>
            {violation.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="font-medium mb-2">Description:</h4>
        <p className="text-sm text-muted-foreground">{violation.description}</p>
      </div>

      {violation.photos.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium mb-2">Photos:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {violation.photos.map((photo, index) => (
              <img
                key={index}
                src={photo}
                alt={`Evidence ${index + 1}`}
                className="w-full h-24 object-cover rounded cursor-pointer"
                onClick={() => window.open(photo, '_blank')}
              />
            ))}
          </div>
        </div>
      )}

      {(violation.reporterEmail || violation.reporterPhone) && (
        <div className="mb-4">
          <h4 className="font-medium mb-2">Reporter Contact:</h4>
          {violation.reporterEmail && (
            <p className="text-sm text-muted-foreground">Email: {violation.reporterEmail}</p>
          )}
          {violation.reporterPhone && (
            <p className="text-sm text-muted-foreground">Phone: {violation.reporterPhone}</p>
          )}
        </div>
      )}

      <div className="mb-4">
        <h4 className="font-medium mb-2">Admin Notes:</h4>
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add admin notes..."
              rows={3}
            />
            <div className="flex space-x-2">
              <Button size="sm" onClick={handleSaveNotes}>
                Save Notes
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              {violation.adminNotes || 'No admin notes yet.'}
            </p>
            <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
              {violation.adminNotes ? 'Edit Notes' : 'Add Notes'}
            </Button>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Status:</label>
          <Select
            value={violation.status}
            onChange={(e) => handleStatusChange(e.target.value as Violation['status'])}
            className="w-40"
          >
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </Select>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowEmailForm(true)}
          >
            Send Email
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => onDelete(violation.id)}
          >
            Delete
          </Button>
        </div>
      </div>

      {showEmailForm && (
        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium mb-4">Send Violation Notice</h4>
          <div className="space-y-4">
            <div>
              <Label htmlFor="recipientEmail">Recipient Email *</Label>
              <Input
                id="recipientEmail"
                type="email"
                value={emailData.recipientEmail}
                onChange={(e) => setEmailData({ ...emailData, recipientEmail: e.target.value })}
                placeholder="resident@example.com"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={emailData.subject}
                onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={emailData.message}
                onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                rows={6}
                required
              />
            </div>
            
            <div className="flex space-x-2">
              <Button onClick={handleSendEmail} disabled={!emailData.recipientEmail || !emailData.subject || !emailData.message}>
                Send Email
              </Button>
              <Button variant="outline" onClick={() => setShowEmailForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViolationCard;