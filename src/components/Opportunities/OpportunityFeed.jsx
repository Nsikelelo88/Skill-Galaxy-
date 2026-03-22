import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import OpportunityCard from './OpportunityCard';

export default function OpportunityFeed() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchOpportunities = async () => {
      const demoOpportunities = [
        {
          id: '1',
          title: 'Software Development Intern',
          type: 'internship',
          company: 'TechCorp SA',
          organization: 'TechCorp SA',
          location: 'Durban, KZN',
          requiredSkills: ['JavaScript', 'React', 'Python'],
          description: 'Looking for passionate developers to join our team and help ship production features.',
          url: '#',
        },
        {
          id: '2',
          title: 'Hair Stylist Position',
          type: 'job',
          company: 'Umlazi Salon',
          organization: 'Umlazi Salon',
          location: 'Umlazi, KZN',
          requiredSkills: ['Braiding', 'Weaving', 'Styling'],
          description: 'Experienced hair stylist needed for a busy salon serving walk-in and returning clients.',
          url: '#',
        },
        {
          id: '3',
          title: 'Micro-Loan Program',
          type: 'loan',
          company: 'KZN Small Business Fund',
          organization: 'KZN Small Business Fund',
          location: 'Remote',
          requiredSkills: ['Business Plan', 'Experience'],
          description: 'Funding support for informal workers who want to launch or expand a small business.',
          url: '#',
        },
      ];

      setOpportunities(demoOpportunities);
      setLoading(false);
    };

    fetchOpportunities();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-cyan-300">Loading opportunities...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-cyan-300">Opportunities</h1>
          <p className="text-gray-400">
            Matched to your skills{user?.email ? ` for ${user.email}` : ''}
          </p>
        </div>

        <div className="space-y-4">
          {opportunities.map((opp) => (
            <OpportunityCard key={opp.id} opportunity={opp} />
          ))}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => window.history.back()}
            className="text-cyan-300 hover:underline"
          >
            Back to Profile
          </button>
        </div>
      </div>
    </div>
  );
}