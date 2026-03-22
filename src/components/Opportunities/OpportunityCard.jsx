export default function OpportunityCard({ opportunity }) {
  const getTypeColor = (type) => {
    switch(type) {
      case 'internship': return 'bg-blue-500/20 text-blue-400';
      case 'job': return 'bg-green-500/20 text-green-400';
      case 'loan': return 'bg-orange-500/20 text-orange-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:border-galaxy-teal/50 transition">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-semibold">{opportunity.title}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(opportunity.type)}`}>
          {opportunity.type.toUpperCase()}
        </span>
      </div>

      <p className="text-gray-400 text-sm mb-2">
        {opportunity.company} • {opportunity.location}
      </p>

      <p className="text-gray-300 mb-4">{opportunity.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {opportunity.requiredSkills.map((skill, idx) => (
          <span key={idx} className="px-2 py-1 bg-galaxy-purple/50 rounded-full text-xs">
            {skill}
          </span>
        ))}
      </div>

      <button
        onClick={() => window.open(opportunity.url, '_blank')}
        className="px-4 py-2 bg-galaxy-teal/20 border border-galaxy-teal rounded-lg text-galaxy-teal hover:bg-galaxy-teal/30 transition text-sm"
      >
        Apply Now →
      </button>
    </div>
  );
}