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

  // Campi specifici per Freelancer
  description: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
  },
  skills: {  // Manteniamo 'skills' come nome coerente
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
  discord: {
    type: String,
    trim: true,
  },
  slack: {
    type: String,
    trim: true,
  },
  projects: {
    type: [ProjectSchema],
    default: [],
    validate: {
      validator: function (projects) {
        if (!projects || projects.length === 0) return true;
        return projects.every(p => {
          const hasTitle = typeof p.title === 'string' && p.title.trim() !== '';
          const hasDescription = typeof p.description === 'string' && p.description.trim() !== '';
          return hasTitle && hasDescription;
        });
      },
      message: 'Ogni progetto deve avere title e description'
    }
  },

  // Statistiche utente
  publishedJobs: {
    type: Number,
    default: 0
  },
  completedJobs: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
});

// Indici
userSchema.index({ role: 1 });
userSchema.index({ skills: 1 });
userSchema.index({ address: 1, isActive: 1 });

// Metodo per ottenere il profilo pubblico
userSchema.methods.getPublicProfile = function () {
  const publicData = {
    address: this.address,
    nickname: this.nickname,
    role: this.role,
    createdAt: this.createdAt,
    publishedJobs: this.publishedJobs,
    completedJobs: this.completedJobs,
  };

  // Aggiungi campi specifici per FREELANCER
  if (this.role === 'FREELANCER') {
    publicData.description = this.description;
    publicData.email = this.email;
    publicData.skills = this.skills;  // Usa 'skills' non 'keySkills'
    publicData.github = this.github;
    publicData.portfolio = this.portfolio;
    publicData.discord = this.discord;
    publicData.slack = this.slack;
    publicData.projects = this.projects;
  }

  return publicData;
};

module.exports = mongoose.model('User', userSchema);