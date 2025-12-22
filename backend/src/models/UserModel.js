const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  link: {
    type: String,
  },
  imageIds: {
    type: [String],
    default: []
  }
}, { _id: false });

const userSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  nickname: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ['CLIENT', 'FREELANCER'],
    default: 'CLIENT'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Contatti
  email: {
    type: String,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },

  // Campi specifici per Freelancer
  titles: {
    type: [String],
    default: []
  },
  keySkills: {
    type: [String],
    default: []
  },
  github: {
    type: String,
    trim: true,
  },
  portfolio: {
    type: String,
    trim: true,
  },
  projects: {
    type: [ProjectSchema],
    default: [],
    validate: {
      validator: function(projects) {
        if (!projects || projects.length === 0) return true;
        return projects.every(p => {
          const hasTitle = typeof p.title === 'string' && p.title.trim() !== '';
          const hasDescription = typeof p.description === 'string' && p.description.trim() !== '';
          return hasTitle && hasDescription;
        });
      },
      message: 'Ogni progetto deve avere title e description quando viene fornito'
    }
  },

  // Statistiche
  publishedJobs: {
    type: Number,
    default: 0,
  },
  completedJobs: {
    type: Number,
    default: 0,
  },
  totalEarnings: {
    type: Number,
    default: 0,
  },
  totalSpent: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Indici aggiuntivi (solo questi, address è già coperto da unique)
userSchema.index({ role: 1 });
userSchema.index({ keySkills: 1 });

// Metodo per ottenere il profilo pubblico
userSchema.methods.getPublicProfile = function() {
  return {
    address: this.address,
    nickname: this.nickname,
    role: this.role,
    email: this.email,
    phone: this.phone,
    titles: this.titles,
    skills: this.keySkills, // Manteniamo 'skills' per compatibilità frontend
    projects: this.projects,
    github: this.github,
    portfolio: this.portfolio,
    publishedJobs: this.publishedJobs,
    completedJobs: this.completedJobs,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);