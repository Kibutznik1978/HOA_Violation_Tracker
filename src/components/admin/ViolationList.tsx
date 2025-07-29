import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Violation } from '../../types';
import { Select } from '../ui/select';
import ViolationCard from './ViolationCard';

interface ViolationListProps {
  hoaId: string;
}

const ViolationList: React.FC<ViolationListProps> = ({ hoaId }) => {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    // Use simple query without orderBy - works without indexes
    const q = query(
      collection(db, 'violations'),
      where('hoaId', '==', hoaId)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const violationsData: Violation[] = [];
      querySnapshot.forEach((doc) => {
        violationsData.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate(),
          updatedAt: doc.data().updatedAt.toDate(),
        } as Violation);
      });
      // Sort manually in JavaScript (works perfectly for typical HOA volumes)
      violationsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      setViolations(violationsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [hoaId]);

  const updateViolationStatus = async (violationId: string, status: Violation['status']) => {
    try {
      await updateDoc(doc(db, 'violations', violationId), {
        status,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating violation status:', error);
    }
  };

  const deleteViolation = async (violationId: string) => {
    if (window.confirm('Are you sure you want to delete this violation report?')) {
      try {
        await deleteDoc(doc(db, 'violations', violationId));
      } catch (error) {
        console.error('Error deleting violation:', error);
      }
    }
  };

  const filteredViolations = violations.filter(violation => 
    statusFilter === 'all' || violation.status === statusFilter
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-muted-foreground">Loading violations...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Violation Reports</h2>
        <div className="flex items-center space-x-2">
          <label htmlFor="status-filter" className="text-sm font-medium">
            Filter by status:
          </label>
          <Select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-40"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </Select>
        </div>
      </div>

      {filteredViolations.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {statusFilter === 'all' 
              ? 'No violation reports found.' 
              : `No ${statusFilter} violations found.`
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredViolations.map((violation) => (
            <ViolationCard
              key={violation.id}
              violation={violation}
              onStatusUpdate={updateViolationStatus}
              onDelete={deleteViolation}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ViolationList;