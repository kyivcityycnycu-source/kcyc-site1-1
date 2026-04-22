import React, { useState, useEffect, useMemo } from 'react';

import { 

  Users, FileText, Calendar, LogOut, Plus, Search, Trash2, Edit2, Download, Briefcase, CheckCircle, XCircle, Clock, Loader2, Save, GripVertical, List, Languages, Image as ImageIcon, Smile, Filter, ChevronDown, ChevronUp, Building2, Palette, Handshake, Link as LinkIcon, Settings, Mail, Instagram, Menu, X, Sun, Moon, Heart

} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

import { onSnapshot, query, collection, orderBy, updateDoc, doc, deleteDoc, writeBatch, addDoc } from 'firebase/firestore';

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

import { db, storage } from '../firebaseConfig';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

import { ContactSubmission, DocumentItem, Project, Opportunity, TeamMember, Department, PartnerItem, PartnerType, DonationRequisite } from '../types';

import { ApplicationDetailsModal } from '../components/ApplicationDetailsModal';
import { AdminFormBuilder } from '../components/AdminFormBuilder';

// We will dynamically import xlsx when needed to avoid window.fetch overwrite error



export const AdminDashboard: React.FC = () => {

  const navigate = useNavigate();

  const { logout } = useAuth();

  const { theme, toggleTheme } = useTheme();
  const { language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'submissions' | 'projects' | 'docs' | 'opportunities' | 'team' | 'partners' | 'donations'>('submissions');

  const [loading, setLoading] = useState(true);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);



  // Data States

  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);

  const [documents, setDocuments] = useState<DocumentItem[]>([]);

  const [projects, setProjects] = useState<Project[]>([]);

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  const [departments, setDepartments] = useState<Department[]>([]);

  const [partners, setPartners] = useState<PartnerItem[]>([]);

  const [partnerTypes, setPartnerTypes] = useState<PartnerType[]>([]);

  const [donations, setDonations] = useState<DonationRequisite[]>([]);

  

  // Drag and Drop State

  const [draggedDeptIndex, setDraggedDeptIndex] = useState<number | null>(null);

  const [draggedProjectIndex, setDraggedProjectIndex] = useState<number | null>(null);

  const [draggedDocIndex, setDraggedDocIndex] = useState<number | null>(null);

  const [draggedPartnerIndex, setDraggedPartnerIndex] = useState<number | null>(null);

  const [draggedPartnerTypeIndex, setDraggedPartnerTypeIndex] = useState<number | null>(null);

  const [draggedMemberIndex, setDraggedMemberIndex] = useState<number | null>(null);

  const [draggedDonationIndex, setDraggedDonationIndex] = useState<number | null>(null);

  // Submission Filters

  const [submissionFilter, setSubmissionFilter] = useState<'event' | 'opportunity' | 'contact' | 'newsletter' | 'support' | 'internship'>('event');

  const [selectedDynamicFilter, setSelectedDynamicFilter] = useState<string>('all');



  // Team Filters & State

  const [teamFilterDept, setTeamFilterDept] = useState<string>('all');

  const [showDeptManager, setShowDeptManager] = useState(false);



  // Partners State

  const [partnerFilterType, setPartnerFilterType] = useState<string>(''); // Default to first available type

  const [showPartnerTypeManager, setShowPartnerTypeManager] = useState(false);



  // Form States

  const [isAddingProject, setIsAddingProject] = useState(false);

  const [newProject, setNewProject] = useState<Partial<Project>>({});

  const [projectLang, setProjectLang] = useState<'uk' | 'en'>('uk');

  

  const [isAddingOpp, setIsAddingOpp] = useState(false);

  const [newOpp, setNewOpp] = useState<Partial<Opportunity>>({ type: 'Volunteering' });

  const [oppLang, setOppLang] = useState<'uk' | 'en'>('uk');



  const [isAddingTeam, setIsAddingTeam] = useState(false);

  const [newTeamMember, setNewTeamMember] = useState<Partial<TeamMember>>({ details: [], detailsEn: [] });

  const [teamLang, setTeamLang] = useState<'uk' | 'en'>('uk');

  const [teamDetailsStr, setTeamDetailsStr] = useState('');

  const [teamDetailsEnStr, setTeamDetailsEnStr] = useState('');



  const [isAddingDept, setIsAddingDept] = useState(false);

  const [newDept, setNewDept] = useState<Partial<Department>>({ color: '#031B47' });

  const [deptLang, setDeptLang] = useState<'uk' | 'en'>('uk');



  const [isAddingPartner, setIsAddingPartner] = useState(false);

  const [newPartner, setNewPartner] = useState<Partial<PartnerItem>>({ bgColor: '#ffffff', link: '#' });

  const [partnerLang, setPartnerLang] = useState<'uk' | 'en'>('uk');



  const [isAddingPartnerType, setIsAddingPartnerType] = useState(false);

  const [newPartnerType, setNewPartnerType] = useState<Partial<PartnerType>>({ color: '#031B47' });

  const [partnerTypeLang, setPartnerTypeLang] = useState<'uk' | 'en'>('uk');

  const [isAddingDonation, setIsAddingDonation] = useState(false);

  const [newDonation, setNewDonation] = useState<Partial<DonationRequisite>>({ type: 'copy', color: 'bg-kmmr-blue' });

  const [donationLang, setDonationLang] = useState<'uk' | 'en'>('uk');

  const [selectedApplication, setSelectedApplication] = useState<any | null>(null);



  const [fileToUpload, setFileToUpload] = useState<File | null>(null);



  // Helper to handle permission errors nicely

  const handleFirebaseError = (error: any, action: string) => {

    console.error(`Error during ${action}:`, error);

    if (error.code === 'permission-denied') {

      alert(`Помилка доступу (${action}).\n\nБудь ласка, перевірте 'Firestore Database Rules' або 'Storage Rules' у Firebase Console.\n\nКод помилки: permission-denied`);

    } else {

      alert(`Помилка (${action}): ${error.message}`);

    }

  };



  // --- FETCH DATA (Realtime Listeners) ---

  useEffect(() => {

    try {

      const unsubSubmissions = onSnapshot(query(collection(db, "submissions"), orderBy("createdAt", "desc")), (snapshot) => {

        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

        setSubmissions(data);

      }, (error) => console.error("Submissions listener error:", error));



      const unsubProjects = onSnapshot(collection(db, "projects"), (snapshot) => {

        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));

        data.sort((a,b) => {

          const orderA = a.order !== undefined ? a.order : 999;

          const orderB = b.order !== undefined ? b.order : 999;

          return orderA - orderB;

        });

        setProjects(data);

      }, (error) => console.error("Projects listener error:", error));



      const unsubDocs = onSnapshot(collection(db, "documents"), (snapshot) => {

        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DocumentItem));

        data.sort((a,b) => {

          const orderA = a.order !== undefined ? a.order : 999;

          const orderB = b.order !== undefined ? b.order : 999;

          return orderA - orderB;

        });

        setDocuments(data);

      }, (error) => console.error("Docs listener error:", error));

      

      const unsubOpps = onSnapshot(collection(db, "opportunities"), (snapshot) => {

        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Opportunity));

        setOpportunities(data);

      }, (error) => console.error("Opps listener error:", error));



      const unsubTeam = onSnapshot(collection(db, "team"), (snapshot) => {

        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeamMember));

        data.sort((a,b) => {

          const orderA = a.order !== undefined ? a.order : 999;

          const orderB = b.order !== undefined ? b.order : 999;

          return orderA - orderB;

        });

        setTeamMembers(data);

      }, (error) => console.error("Team listener error:", error));



      const unsubDepts = onSnapshot(collection(db, "departments"), (snapshot) => {

        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Department));

        data.sort((a,b) => {

          const orderA = a.order !== undefined ? a.order : 999;

          const orderB = b.order !== undefined ? b.order : 999;

          if (orderA !== orderB) return orderA - orderB;

          return a.name.localeCompare(b.name);

        });

        setDepartments(data);

      }, (error) => console.error("Departments listener error:", error));



      const unsubPartners = onSnapshot(collection(db, "partners"), (snapshot) => {

        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PartnerItem));

        data.sort((a,b) => {

          const orderA = a.order !== undefined ? a.order : 999;

          const orderB = b.order !== undefined ? b.order : 999;

          return orderA - orderB;

        });

        setPartners(data);

      }, (error) => console.error("Partners listener error:", error));



      const unsubPartnerTypes = onSnapshot(collection(db, "partner_types"), (snapshot) => {

        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PartnerType));

        data.sort((a,b) => {

          const orderA = a.order !== undefined ? a.order : 999;

          const orderB = b.order !== undefined ? b.order : 999;

          return orderA - orderB;

        });

        setPartnerTypes(data);

        // Set default filter if not set and data exists

        if (data.length > 0) {

           setPartnerFilterType(prev => prev || data[0].id);

        }

      }, (error) => console.error("Partner Types listener error:", error));



      const unsubDonations = onSnapshot(collection(db, "donations"), (snapshot) => {

        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DonationRequisite));

        data.sort((a,b) => {

          const orderA = a.order !== undefined ? a.order : 999;

          const orderB = b.order !== undefined ? b.order : 999;

          return orderA - orderB;

        });

        setDonations(data);

      }, (error) => console.error("Donations listener error:", error));



      setLoading(false);



      return () => {

        unsubSubmissions();

        unsubProjects();

        unsubDocs();

        unsubOpps();

        unsubTeam();

        unsubDepts();

        unsubPartners();

        unsubPartnerTypes();

        unsubDonations();

      };

    } catch (e) {

      console.error("Setup listeners failed", e);

      setLoading(false);

    }

  }, []);



  // --- ACTIONS ---



  const handleLogout = async () => {

    await logout();

    navigate('/login');

  };



  const handleNavClick = (tab: any) => {

    setActiveTab(tab);

    setIsSidebarOpen(false); // Close sidebar on mobile after click

  };



  const updateStatus = async (id: string, newStatus: ContactSubmission['status']) => {

    try {

      await updateDoc(doc(db, "submissions", id), { status: newStatus });

    } catch (e) { handleFirebaseError(e, 'оновлення статусу'); }

  };



  const deleteItem = async (collectionName: string, id: string) => {

    if(confirm('Ви впевнені, що хочете видалити цей запис?')) {

      try {

        await deleteDoc(doc(db, collectionName, id));

      } catch (e: any) {

        handleFirebaseError(e, 'видалення запису');

      }

    }

  };



  // ОСЬ ДОДАНА ФУНКЦІЯ ДЛЯ ВИДАЛЕННЯ ДОКУМЕНТІВ

  const handleDeleteDocument = async (id: string, fileUrl: string) => {

    if (window.confirm("Ви впевнені, що хочете видалити цей документ?")) {

      try {

        // Спочатку намагаємося видалити фізичний файл зі Storage

        try {

           if (fileUrl) {

             const fileRef = ref(storage, fileUrl);

             await deleteObject(fileRef);

           }

        } catch (storageErr) {

           console.warn("Файл не знайдено у Storage або немає доступу:", storageErr);

        }

        

        // Потім видаляємо запис з бази даних

        await deleteDoc(doc(db, "documents", id));

        

        // Оновлюємо локальний стан інтерфейсу

        setDocuments(prev => prev.filter(item => item.id !== id));

      } catch (error: any) {

        console.error("Помилка видалення:", error);

        alert("Помилка видалення документу");

      }

    }

  };



  const handleDeleteProject = async (id: string) => {

    console.log("Delete clicked for ID:", id);

    if (window.confirm("Ви впевнені, що хочете видалити цей проєкт?")) {

      try {

        await deleteDoc(doc(db, "projects", id));

        setProjects(prev => prev.filter(item => item.id !== id));

      } catch (error) {

        console.error("Помилка видалення:", error);

        alert("Не вдалося видалити елемент");

      }

    }

  };



  const handleDeleteOpportunity = async (id: string) => {

      console.log("Delete clicked for ID:", id);

      if (window.confirm("Ви впевнені, що хочете видалити цю можливість?")) {

          try {

              await deleteDoc(doc(db, "opportunities", id));

              setOpportunities(prev => prev.filter(item => item.id !== id));

          } catch (error) {

              console.error("Помилка видалення:", error);

              alert("Не вдалося видалити елемент");

          }

      }

  };



  const handleDeleteMember = async (id: string) => {

      console.log("Delete clicked for ID:", id);

      if (window.confirm("Ви впевнені, що хочете видалити цього учасника?")) {

          try {

              await deleteDoc(doc(db, "team", id));

              setTeamMembers(prev => prev.filter(item => item.id !== id));

          } catch (error) {

              console.error("Помилка видалення:", error);

              alert("Не вдалося видалити елемент");

          }

      }

  };



  const handleDeleteDepartment = async (id: string) => {

      console.log("Delete clicked for ID:", id);

      if (window.confirm("Ви впевнені, що хочете видалити цей департамент?")) {

          try {

              await deleteDoc(doc(db, "departments", id));

              setDepartments(prev => prev.filter(item => item.id !== id));

          } catch (error) {

              console.error("Помилка видалення:", error);

              alert("Не вдалося видалити елемент");

          }

      }

  };



  const handleDeletePartner = async (id: string) => {

      console.log("Delete clicked for ID:", id);

      if (window.confirm("Ви впевнені, що хочете видалити цього партнера?")) {

          try {

              await deleteDoc(doc(db, "partners", id));

              setPartners(prev => prev.filter(item => item.id !== id));

          } catch (error) {

              console.error("Помилка видалення:", error);

              alert("Не вдалося видалити елемент");

          }

      }

  };



  const handleDeletePartnerType = async (id: string) => {

      console.log("Delete clicked for ID:", id);

      if (window.confirm("Ви впевнені, що хочете видалити цей тип партнера?")) {

          try {

              await deleteDoc(doc(db, "partner_types", id));

              setPartnerTypes(prev => prev.filter(item => item.id !== id));

          } catch (error) {

              console.error("Помилка видалення:", error);

              alert("Не вдалося видалити елемент");

          }

      }

  };



  const handleDeleteDonation = async (id: string) => {

      if (window.confirm("Ви впевнені, що хочете видалити цей реквізит?")) {

          try {

              await deleteDoc(doc(db, "donations", id));

              setDonations(prev => prev.filter(item => item.id !== id));

          } catch (error) {

              console.error("Помилка видалення:", error);

              alert("Не вдалося видалити елемент");

          }

      }

  };



  // Helper for move (Mobile support for Drag and Drop replacement)

  const moveItem = async (

    index: number, 

    direction: 'up' | 'down', 

    list: any[], 

    setList: (l: any[]) => void, 

    collectionName: string

  ) => {

    if ((direction === 'up' && index === 0) || (direction === 'down' && index === list.length - 1)) return;

    

    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    const updatedList = [...list];

    

    // Swap items in local state

    [updatedList[index], updatedList[targetIndex]] = [updatedList[targetIndex], updatedList[index]];

    setList(updatedList);



    // Update Order in DB

    try {

      const batch = writeBatch(db);

      updatedList.forEach((item, idx) => {

        batch.update(doc(db, collectionName, item.id), { order: idx });

      });

      await batch.commit();

    } catch (error: any) {

      handleFirebaseError(error, `зміна порядку ${collectionName}`);

    }

  };



  // Specialized move for Partner (Filtered list)

  const movePartner = async (index: number, direction: 'up' | 'down') => {

     const visiblePartners = partners.filter(p => p.type === partnerFilterType);

     if ((direction === 'up' && index === 0) || (direction === 'down' && index === visiblePartners.length - 1)) return;



     const targetIndex = direction === 'up' ? index - 1 : index + 1;

     const itemA = visiblePartners[index];

     const itemB = visiblePartners[targetIndex];



     // Swap in full list by finding indices

     const idxA = partners.findIndex(p => p.id === itemA.id);

     const idxB = partners.findIndex(p => p.id === itemB.id);

     

     const newFullList = [...partners];

     [newFullList[idxA], newFullList[idxB]] = [newFullList[idxB], newFullList[idxA]];

     setPartners(newFullList);



     try {

       const batch = writeBatch(db);

       // Re-indexing visible list:

       const newVisible = newFullList.filter(p => p.type === partnerFilterType);

       newVisible.forEach((item, idx) => {

         batch.update(doc(db, "partners", item.id), { order: idx });

       });

       await batch.commit();

     } catch(e) { console.error(e); }

  };



  // Specialized move for Team (Filtered list)

  const moveTeamMember = async (index: number, direction: 'up' | 'down') => {

     const visibleMembers = teamMembers.filter(m => teamFilterDept === 'all' || m.department === teamFilterDept);

     if ((direction === 'up' && index === 0) || (direction === 'down' && index === visibleMembers.length - 1)) return;



     const targetIndex = direction === 'up' ? index - 1 : index + 1;

     const itemA = visibleMembers[index];

     const itemB = visibleMembers[targetIndex];



     const idxA = teamMembers.findIndex(m => m.id === itemA.id);

     const idxB = teamMembers.findIndex(m => m.id === itemB.id);



     const newFullList = [...teamMembers];

     [newFullList[idxA], newFullList[idxB]] = [newFullList[idxB], newFullList[idxA]];

     setTeamMembers(newFullList);



     try {

       const batch = writeBatch(db);

       // Re-index only visible members to maintain their relative order

       const newVisible = newFullList.filter(m => teamFilterDept === 'all' || m.department === teamFilterDept);

       newVisible.forEach((item, idx) => {

         batch.update(doc(db, "team", item.id), { order: idx });

       });

       await batch.commit();

     } catch(e) { console.error(e); }

  };



  const handleFileUpload = async (file: File, folder: string): Promise<string> => {

    const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);

    await uploadBytes(storageRef, file);

    return await getDownloadURL(storageRef);

  };



  // --- DRAG AND DROP HANDLERS ---

  

  const handleDragStartDept = (index: number) => setDraggedDeptIndex(index);

  const handleDropDept = async (dropIndex: number) => {

    if (draggedDeptIndex === null || draggedDeptIndex === dropIndex) return;

    const updated = [...departments];

    const [draggedItem] = updated.splice(draggedDeptIndex, 1);

    updated.splice(dropIndex, 0, draggedItem);

    setDepartments(updated);

    setDraggedDeptIndex(null);

    try {

      const batch = writeBatch(db);

      updated.forEach((item, index) => {

        batch.update(doc(db, "departments", item.id), { order: index });

      });

      await batch.commit();

    } catch (error: any) { handleFirebaseError(error, 'оновлення порядку департаментів'); }

  };



  const handleDragStartProject = (index: number) => setDraggedProjectIndex(index);

  const handleDropProject = async (dropIndex: number) => {

    if (draggedProjectIndex === null || draggedProjectIndex === dropIndex) return;

    const updated = [...projects];

    const [draggedItem] = updated.splice(draggedProjectIndex, 1);

    updated.splice(dropIndex, 0, draggedItem);

    setProjects(updated);

    setDraggedProjectIndex(null);

    try {

      const batch = writeBatch(db);

      updated.forEach((item, index) => {

        batch.update(doc(db, "projects", item.id), { order: index });

      });

      await batch.commit();

    } catch (error: any) { handleFirebaseError(error, 'оновлення порядку проєктів'); }

  };



  const handleDragStartDoc = (index: number) => setDraggedDocIndex(index);

  const handleDropDoc = async (dropIndex: number) => {

    if (draggedDocIndex === null || draggedDocIndex === dropIndex) return;

    const updated = [...documents];

    const [draggedItem] = updated.splice(draggedDocIndex, 1);

    updated.splice(dropIndex, 0, draggedItem);

    setDocuments(updated);

    setDraggedDocIndex(null);

    try {

      const batch = writeBatch(db);

      updated.forEach((item, index) => {

        batch.update(doc(db, "documents", item.id), { order: index });

      });

      await batch.commit();

    } catch (error: any) { handleFirebaseError(error, 'оновлення порядку документів'); }

  };



  const handleDragStartPartnerType = (index: number) => setDraggedPartnerTypeIndex(index);

  const handleDropPartnerType = async (dropIndex: number) => {

    if (draggedPartnerTypeIndex === null || draggedPartnerTypeIndex === dropIndex) return;

    const updated = [...partnerTypes];

    const [draggedItem] = updated.splice(draggedPartnerTypeIndex, 1);

    updated.splice(dropIndex, 0, draggedItem);

    setPartnerTypes(updated);

    setDraggedPartnerTypeIndex(null);

    try {

      const batch = writeBatch(db);

      updated.forEach((item, index) => {

        batch.update(doc(db, "partner_types", item.id), { order: index });

      });

      await batch.commit();

    } catch (error: any) { handleFirebaseError(error, 'оновлення порядку типів партнерів'); }

  };



  const handleDragStartPartner = (index: number) => setDraggedPartnerIndex(index);

  const handleDropPartner = async (dropIndex: number) => {

    if (draggedPartnerIndex === null || draggedPartnerIndex === dropIndex) return;

    

    // We are reordering within the filtered list

    const filteredList = partners.filter(p => p.type === partnerFilterType);

    const updatedFiltered = [...filteredList];

    

    const [draggedItem] = updatedFiltered.splice(draggedPartnerIndex, 1);

    updatedFiltered.splice(dropIndex, 0, draggedItem);

    

    // Update local state by merging

    const otherItems = partners.filter(p => p.type !== partnerFilterType);

    const newFullList = [...otherItems, ...updatedFiltered];

    setPartners(newFullList);

    setDraggedPartnerIndex(null);



    try {

      const batch = writeBatch(db);

      updatedFiltered.forEach((item, index) => {

        batch.update(doc(db, "partners", item.id), { order: index });

      });

      await batch.commit();

    } catch (error: any) { handleFirebaseError(error, 'оновлення порядку партнерів'); }

  };



  const handleDragStartMember = (index: number) => setDraggedMemberIndex(index);

  const handleDropMember = async (dropIndex: number) => {

    if (draggedMemberIndex === null || draggedMemberIndex === dropIndex) return;



    // Filter list logic

    const filteredList = teamMembers.filter(m => teamFilterDept === 'all' || m.department === teamFilterDept);

    

    // Check if dragging within filtered context

    if (dropIndex >= filteredList.length) return;



    const updatedFiltered = [...filteredList];

    const [draggedItem] = updatedFiltered.splice(draggedMemberIndex, 1);

    updatedFiltered.splice(dropIndex, 0, draggedItem);



    // Merge back

    const otherItems = teamMembers.filter(m => !(teamFilterDept === 'all' || m.department === teamFilterDept));

    const newFullList = [...otherItems, ...updatedFiltered];

    setTeamMembers(newFullList);

    setDraggedMemberIndex(null);



    try {

      const batch = writeBatch(db);

      updatedFiltered.forEach((item, index) => {

        batch.update(doc(db, "team", item.id), { order: index });

      });

      await batch.commit();

    } catch (error: any) { handleFirebaseError(error, 'оновлення порядку команди'); }

  };





  const handleDragOver = (e: React.DragEvent) => {

    e.preventDefault(); 

  };



  // --- EXTRACT DYNAMIC FILTER OPTIONS ---

  const dynamicFilterOptions = useMemo(() => {
    const options = new Set<string>();
    submissions.forEach((sub: any) => {
      if (submissionFilter === 'event' || submissionFilter === 'opportunity') {
        if (sub.formType === 'opportunity_application' && sub.opportunityTitle) {
          const subType = (sub as any).type;
          if (submissionFilter === 'event' && subType === 'Event') {
            options.add(sub.opportunityTitle);
          } else if (submissionFilter === 'opportunity' && subType !== 'Event') {
            options.add(sub.opportunityTitle);
          }
        }
      } else if (submissionFilter === 'contact') {
        if (sub.formType === 'general_contact' && sub.department) {
          options.add(sub.department);
        }
      } else if (submissionFilter === 'support') {
        if (sub.formType === 'initiative_support' && sub.supportType) {
          options.add(sub.supportType);
        }
      }
    });
    return Array.from(options).sort();
  }, [submissions, submissionFilter]);



  // --- FILTER LOGIC ---

  const getFilteredSubmissions = () => {
    let filtered = submissions.filter(sub => {
      const type = (sub as any).formType;
      const subType = (sub as any).type;

      if (submissionFilter === 'newsletter') return type === 'newsletter';
      if (submissionFilter === 'support') return type === 'initiative_support';
      if (submissionFilter === 'internship') return type === 'internship_registration';
      if (submissionFilter === 'contact') return type === 'general_contact';
      
      if (submissionFilter === 'event') {
        return type === 'opportunity_application' && subType === 'Event';
      }
      
      if (submissionFilter === 'opportunity') {
        return type === 'opportunity_application' && subType !== 'Event';
      }

      return false;
    });

    // Apply Dynamic Filter if active
    if (selectedDynamicFilter !== 'all') {
      if (submissionFilter === 'event' || submissionFilter === 'opportunity') {
        filtered = filtered.filter(sub => (sub as any).opportunityTitle === selectedDynamicFilter);
      } else if (submissionFilter === 'contact') {
        filtered = filtered.filter(sub => (sub as any).department === selectedDynamicFilter);
      } else if (submissionFilter === 'support') {
        filtered = filtered.filter(sub => (sub as any).supportType === selectedDynamicFilter);
      }
    }

    // Apply Sorting
    return [...filtered].sort((a: any, b: any) => {
      if (submissionFilter === 'event' || submissionFilter === 'opportunity') {
        const titleA = a.opportunityTitle || '';
        const titleB = b.opportunityTitle || '';
        return titleA.localeCompare(titleB);
      }
      if (submissionFilter === 'contact') {
        const getDeptName = (id: string) => {
          const dept = departments.find(d => d.id === id);
          return dept ? (language === 'en' && dept.nameEn ? dept.nameEn : dept.name) : id;
        };
        const deptA = getDeptName(a.department || '');
        const deptB = getDeptName(b.department || '');
        return deptA.localeCompare(deptB);
      }
      if (submissionFilter === 'support') {
        const typeA = a.supportType || '';
        const typeB = b.supportType || '';
        return typeA.localeCompare(typeB);
      }
      // Default sort by date (already handled by listener but good to keep as fallback)
      const dateA = a.createdAt?.seconds || 0;
      const dateB = b.createdAt?.seconds || 0;
      return dateB - dateA;
    });
  };



  const filteredSubmissions = getFilteredSubmissions();



  // --- EXPORT TO CSV ---

  const downloadExcel = () => {

    const dataToExport = getFilteredSubmissions();

    

    if (dataToExport.length === 0) {

      alert("Немає даних для експорту");

      return;

    }



    const convertToCSV = (objArray: any[]) => {

      const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;

      let str = '';

      const headers = Object.keys(array[0]);

      str += headers.join(',') + '\r\n';

      

      for (let i = 0; i < array.length; i++) {

        let line = '';

        for (let index in array[i]) {

          if (line !== '') line += ',';

          let value = array[i][index];

          if (value === null || value === undefined) value = '';

          value = value.toString().replace(/"/g, '""');

          if (value.search(/("|,|\n)/g) >= 0) {

            value = `"${value}"`;

          }

          line += value;

        }

        str += line + '\r\n';

      }

      return str;

    };



    const downloadCSV = (csv: string, filename: string) => {

      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });

      const link = document.createElement('a');

      if (link.download !== undefined) {

        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);

        link.setAttribute('download', filename);

        link.style.visibility = 'hidden';

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

      }

    };



    if (submissionFilter === 'newsletter') {

      const formattedData = dataToExport.map((sub, idx) => ({

        "ID": idx + 1,

        "Email": sub.email,

        "Дата підписки": sub.createdAt && typeof sub.createdAt === 'object' 

          ? new Date((sub.createdAt as any).seconds * 1000).toLocaleString('uk-UA') 

          : sub.createdAt || '-'

      }));

      

      const csv = convertToCSV(formattedData);

      downloadCSV(csv, `Newsletter_Export_${new Date().toISOString().split('T')[0]}.csv`);

      return;

    }



    const formattedData = dataToExport.map(sub => {

      const isApp = (sub as any).formType === 'opportunity_application';

      const isSupport = (sub as any).formType === 'initiative_support';

      const isInternship = (sub as any).formType === 'internship_registration';

      const date = sub.createdAt && typeof sub.createdAt === 'object' 

        ? new Date((sub.createdAt as any).seconds * 1000).toLocaleString('uk-UA') 

        : sub.createdAt;

      

      const baseObj = {

        "ID": sub.id,

        "Дата": date,

        "Статус": sub.status,

        "Тип": isSupport ? 'Підтримка ініціативи' : isInternship ? 'Практика' : isApp ? 'Реєстрація' : 'Контакт',

        "Ім'я / Організація": isSupport ? (sub as any).orgName : sub.name,

        "Представник": (sub as any).repName || '-',

        "Телефон": sub.phone,

        "Email": sub.email,

        "Навчальний заклад": (sub as any).university || '-',

        "Спеціальність": (sub as any).specialization || '-',

        "Тег для комунікації": (sub as any).commTag || (sub as any).socialTag || '-',

        "Соцмережі організації": (sub as any).orgSocial || '-',

        "Дата початку події": (sub as any).eventStartDate || (sub as any).eventDate || '-',

        "Дата завершення події": (sub as any).eventEndDate || '-',

        "Подія/Проєкт": (sub as any).opportunityTitle || (sub as any).projectTitle || departments.find(d => d.id === sub.department)?.name || sub.department || '-',

        "Опис/Мотивація": (sub as any).description || sub.motivation || '',

        "Необхідна підтримка": (sub as any).supportType || '-'

      };

      if ((sub as any).answers) {

         Object.entries((sub as any).answers).forEach(([key, val]) => {

            const cleanKey = key.replace(/_/g, ' ').replace('q ', '');

            (baseObj as any)[`Відповідь: ${cleanKey}`] = val;

         });

      }

      return baseObj;

    });



    const csv = convertToCSV(formattedData);

    const fileName = selectedDynamicFilter !== 'all' 

      ? `Export_${selectedDynamicFilter.substring(0, 20)}_${new Date().toISOString().split('T')[0]}.csv`

      : `Export_All_${new Date().toISOString().split('T')[0]}.csv`;

    downloadCSV(csv, fileName);

  };



  // ... (Keep existing update functions for partners, etc)



  const handleSavePartnerType = async (e: React.FormEvent) => {

    e.preventDefault();

    if (!newPartnerType.name) return;

    setLoading(true);



    try {

       let iconUrl = newPartnerType.icon || "";

       if (fileToUpload) {

          iconUrl = await handleFileUpload(fileToUpload, 'partner_type_icons');

       }



       const typePayload = {

          name: newPartnerType.name,

          nameEn: newPartnerType.nameEn || newPartnerType.name,

          description: newPartnerType.description || '',

          descriptionEn: newPartnerType.descriptionEn || newPartnerType.description || '',

          color: newPartnerType.color || '#031B47',

          icon: iconUrl,

          order: newPartnerType.id ? (newPartnerType.order !== undefined ? newPartnerType.order : 999) : partnerTypes.length

       };



       if (newPartnerType.id) {

          await updateDoc(doc(db, "partner_types", newPartnerType.id), typePayload);

       } else {

          await addDoc(collection(db, "partner_types"), typePayload);

       }



       setIsAddingPartnerType(false);

       setNewPartnerType({ color: '#031B47' });

       setFileToUpload(null);



    } catch (error: any) {

       handleFirebaseError(error, 'збереження типу партнера');

    } finally {

       setLoading(false);

    }

  };



  const handleSavePartner = async (e: React.FormEvent) => {

    e.preventDefault();

    if (!newPartner.name || !newPartner.type) return;

    setLoading(true);



    try {

      let imageUrl = "https://placehold.co/200x100";

      if (fileToUpload) {

         try {

           imageUrl = await handleFileUpload(fileToUpload, 'partners');

         } catch(storageErr: any) {

            handleFirebaseError(storageErr, 'завантаження лого');

            setLoading(false);

            return;

         }

      } else if (newPartner.image) {

        imageUrl = newPartner.image;

      }



      // Determine order: if new, put at end of its type list

      const typePartners = partners.filter(p => p.type === newPartner.type);

      const nextOrder = newPartner.id ? (newPartner.order ?? 999) : typePartners.length;



      const partnerPayload = {

        name: newPartner.name,

        nameEn: newPartner.nameEn || newPartner.name,

        type: newPartner.type,

        image: imageUrl,

        bgColor: newPartner.bgColor || '#ffffff',

        link: newPartner.link || '#',

        order: nextOrder

      };



      if (newPartner.id) {

         await updateDoc(doc(db, "partners", newPartner.id), partnerPayload);

      } else {

         await addDoc(collection(db, "partners"), partnerPayload);

      }



      setIsAddingPartner(false);

      setNewPartner({ bgColor: '#ffffff', link: '#' });

      setFileToUpload(null);

    } catch (error: any) {

      handleFirebaseError(error, 'збереження партнера');

    } finally {

      setLoading(false);

    }

  };



  // ... (Reused Handlers: Team, Department, Project, Opps, Docs) ...

  const handleSaveTeamMember = async (e: React.FormEvent) => {

    e.preventDefault();

    if (!newTeamMember.name || !newTeamMember.department) return;

    setLoading(true);



    try {

      let imageUrl = "https://placehold.co/400x400";

      

      if (fileToUpload) {

        try {

          imageUrl = await handleFileUpload(fileToUpload, 'team_images');

        } catch (storageError: any) {

          handleFirebaseError(storageError, 'завантаження фото');

          setLoading(false);

          return;

        }

      } else if (newTeamMember.image) {

        imageUrl = newTeamMember.image;

      }



      const detailsArray = teamDetailsStr.split('\n').filter(line => line.trim() !== '');

      const detailsEnArray = teamDetailsEnStr.split('\n').filter(line => line.trim() !== '');



      // Determine order: if new, put at end of its dept list

      const deptMembers = teamMembers.filter(m => m.department === newTeamMember.department);

      const nextOrder = newTeamMember.id ? (newTeamMember.order ?? 999) : deptMembers.length;



      const teamPayload = {

        name: newTeamMember.name || '',

        nameEn: newTeamMember.nameEn || newTeamMember.name || '',

        department: newTeamMember.department || '',

        role: newTeamMember.role || '',

        roleEn: newTeamMember.roleEn || newTeamMember.role || '',

        bio: newTeamMember.bio || '',

        bioEn: newTeamMember.bioEn || newTeamMember.bio || '',

        email: newTeamMember.email || '',

        instagram: newTeamMember.instagram || '',

        image: imageUrl,

        details: detailsArray,

        detailsEn: detailsEnArray.length > 0 ? detailsEnArray : detailsArray,

        order: nextOrder

      };



      if (newTeamMember.id) {

        await updateDoc(doc(db, "team", newTeamMember.id), teamPayload);

      } else {

        await addDoc(collection(db, "team"), teamPayload);

      }



      setIsAddingTeam(false);

      setNewTeamMember({ details: [], detailsEn: [] });

      setTeamDetailsStr('');

      setTeamDetailsEnStr('');

      setFileToUpload(null);

    } catch (error: any) {

      handleFirebaseError(error, 'збереження команди');

    } finally {

      setLoading(false);

    }

  };



  const handleSaveDepartment = async (e: React.FormEvent) => {

    e.preventDefault();

    if (!newDept.name) return;

    setLoading(true);



    try {

       let iconUrl = newDept.icon || "";

       if (fileToUpload) {

          iconUrl = await handleFileUpload(fileToUpload, 'department_icons');

       }



       const deptPayload = {

          name: newDept.name,

          nameEn: newDept.nameEn || newDept.name,

          description: newDept.description || '',

          descriptionEn: newDept.descriptionEn || newDept.description || '',

          color: newDept.color || '#031B47',

          icon: iconUrl,

          order: newDept.id ? (newDept.order !== undefined ? newDept.order : 999) : departments.length

       };



       if (newDept.id) {

          await updateDoc(doc(db, "departments", newDept.id), deptPayload);

       } else {

          await addDoc(collection(db, "departments"), deptPayload);

       }



       setIsAddingDept(false);

       setNewDept({ color: '#031B47' });

       setFileToUpload(null);



    } catch (error: any) {

       handleFirebaseError(error, 'збереження департаменту');

    } finally {

       setLoading(false);

    }

  };



  const handleAddProject = async (e: React.FormEvent) => {

    e.preventDefault();

    if (!newProject.title || !newProject.description) return;

    setLoading(true);

    try {

      let imageUrl = "https://placehold.co/600x400";

      if (fileToUpload) {

         try {

           imageUrl = await handleFileUpload(fileToUpload, 'project_images');

         } catch(storageErr: any) {

            handleFirebaseError(storageErr, 'завантаження фото проєкту');

            setLoading(false);

            return;

         }

      } else if (newProject.image) {

        imageUrl = newProject.image;

      }

      

      const projectPayload = {
        title: newProject.title || '',
        titleEn: newProject.titleEn || newProject.title || '',
        description: newProject.description || '',
        descriptionEn: newProject.descriptionEn || newProject.description || '',
        fullDescription: newProject.fullDescription || newProject.description || '',
        fullDescriptionEn: newProject.fullDescriptionEn || newProject.descriptionEn || newProject.description || '',
        date: newProject.date || new Date().toISOString().split('T')[0],
        deadline: newProject.deadline || '',
        image: imageUrl,
        instagramLink: newProject.instagramLink || '',
        googleFormLink: newProject.googleFormLink || '',
        ownershipType: newProject.ownershipType || 'own',
        partnerName: newProject.partnerName || '',
        hasRegistration: newProject.hasRegistration !== undefined ? newProject.hasRegistration : true,
        questions: newProject.questions || [],
      };



      if (newProject.id) {

         await updateDoc(doc(db, "projects", newProject.id), projectPayload);

      } else {

         // Logic to add to the TOP of the list:

         // 1. Find the current MIN order

         const currentOrders = projects.map(p => p.order !== undefined ? p.order : 9999);

         const minOrder = currentOrders.length > 0 ? Math.min(...currentOrders) : 0;

         

         // 2. Assign new order as minOrder - 1

         const newOrder = minOrder - 1;



         await addDoc(collection(db, "projects"), {

            ...projectPayload,

            order: newOrder

         });

      }



      setIsAddingProject(false);

      setNewProject({});

      setFileToUpload(null);

    } catch (error: any) {

      handleFirebaseError(error, 'збереження проєкту');

    } finally {

      setLoading(false);

    }

  };



  const handleSaveOpportunity = async (e: React.FormEvent) => {

    e.preventDefault();

    if (!newOpp.title) return;

    setLoading(true);

    try {

      const oppPayload = {
        title: newOpp.title || '',
        titleEn: newOpp.titleEn || newOpp.title || '',
        description: newOpp.description || '',
        descriptionEn: newOpp.descriptionEn || newOpp.description || '',
        deadline: newOpp.deadline || '',
        type: newOpp.type || 'Event',
        link: '#', 
        googleFormLink: newOpp.googleFormLink || '',
        hasRegistration: newOpp.hasRegistration !== undefined ? newOpp.hasRegistration : true,
        questions: newOpp.questions || [],
      };



      if (newOpp.id) {

         await updateDoc(doc(db, "opportunities", newOpp.id), oppPayload);

      } else {

         await addDoc(collection(db, "opportunities"), oppPayload);

      }

      

      setIsAddingOpp(false);

      setNewOpp({ type: 'Volunteering' });

    } catch (err: any) {

      handleFirebaseError(err, 'збереження можливості');

    } finally {

      setLoading(false);

    }

  };



  const handleAddDocument = async (e: React.ChangeEvent<HTMLInputElement>) => {

    if (e.target.files && e.target.files[0]) {

      const file = e.target.files[0];

      setLoading(true);

      try {

        const url = await handleFileUpload(file, 'documents');

        await addDoc(collection(db, "documents"), {

          title: file.name,

          type: file.name.split('.').pop()?.toUpperCase() || 'FILE',

          date: new Date().toLocaleDateString('uk-UA'),

          size: (file.size / 1024 / 1024).toFixed(2) + ' MB',

          link: url,

          order: documents.length

        });

        alert('Документ завантажено!');

      } catch (err: any) {

        handleFirebaseError(err, 'завантаження документу');

      } finally {

        setLoading(false);

      }

    }

  };



  const getStatusColor = (status: string) => {

    switch(status) {

      case 'new': return 'bg-blue-100 text-blue-700';

      case 'contacted': return 'bg-yellow-100 text-yellow-700';

      case 'approved': return 'bg-green-100 text-green-700';

      case 'rejected': return 'bg-red-100 text-red-700';

      default: return 'bg-gray-100 text-gray-700';

    }

  };



  return (

    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 flex relative transition-colors duration-300">

      <ApplicationDetailsModal isOpen={!!selectedApplication} onClose={() => setSelectedApplication(null)} application={selectedApplication} />

      

      {/* Mobile Overlay */}

      {isSidebarOpen && (

        <div 

          className="fixed inset-0 bg-black/50 z-20 md:hidden"

          onClick={() => setIsSidebarOpen(false)}

        />

      )}



      {/* Sidebar */}

      <aside className={`w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col fixed h-full z-30 transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>

        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">

          <div>

            <h1 className="text-xl font-black tracking-wider text-kmmr-blue dark:text-white">КММР ADMIN</h1>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Панель керування</p>

          </div>

          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">

            <X size={24} />

          </button>

        </div>

        

        <nav className="flex-grow p-4 space-y-2 overflow-y-auto">

          {/* ... Navigation buttons ... */}

          <button onClick={() => handleNavClick('submissions')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'submissions' ? 'bg-kmmr-pink text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>

            <Users size={20} />

            <span className="font-medium">Заявки</span>

            {submissions.filter(s => s.status === 'new').length > 0 && (

              <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{submissions.filter(s => s.status === 'new').length}</span>

            )}

          </button>

          <button onClick={() => handleNavClick('projects')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'projects' ? 'bg-kmmr-pink text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>

            <Calendar size={20} />

            <span className="font-medium">Проєкти</span>

          </button>

          <button onClick={() => handleNavClick('opportunities')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'opportunities' ? 'bg-kmmr-pink text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>

            <Briefcase size={20} />

            <span className="font-medium">Можливості</span>

          </button>

           <button onClick={() => handleNavClick('team')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'team' ? 'bg-kmmr-pink text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>

            <Smile size={20} />

            <span className="font-medium">Команда</span>

          </button>

          <button onClick={() => handleNavClick('partners')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'partners' ? 'bg-kmmr-pink text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>

            <Handshake size={20} />

            <span className="font-medium">Партнери</span>

          </button>

          <button onClick={() => handleNavClick('donations')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'donations' ? 'bg-kmmr-pink text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>

            <Heart size={20} />

            <span className="font-medium">Підтримка</span>

          </button>

          <button onClick={() => handleNavClick('docs')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'docs' ? 'bg-kmmr-pink text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>

            <FileText size={20} />

            <span className="font-medium">Документи</span>

          </button>

        </nav>



        <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">

          <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors">

            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}

            <span>{theme === 'dark' ? 'Світла тема' : 'Темна тема'}</span>

          </button>

          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 dark:text-red-400 transition-colors">

            <LogOut size={20} />

            <span>Вийти</span>

          </button>

        </div>

      </aside>



      {/* Main Content */}

      <main className="flex-grow lg:ml-64 p-4 md:p-8 transition-all duration-300 overflow-x-hidden">

        

        {/* Mobile Header Toggle */}

        <div className="lg:hidden mb-6 flex items-center justify-between">

           <div className="flex items-center gap-4">

              <button 

                onClick={() => setIsSidebarOpen(true)} 

                className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow text-kmmr-blue dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700"

              >

                <Menu size={24} />

              </button>

              <h2 className="font-bold text-lg text-gray-800 dark:text-gray-100">Admin Panel</h2>

           </div>

           {loading && <Loader2 className="animate-spin text-kmmr-blue" size={24} />}

        </div>



        {/* Header Desktop */}

        <div className="hidden lg:flex justify-between items-center mb-8">

          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">

            {activeTab === 'submissions' && 'Заявки'}

            {activeTab === 'projects' && 'Керування Проєктами'}

            {activeTab === 'opportunities' && 'Актуальні Можливості'}

            {activeTab === 'docs' && 'Документообіг'}

            {activeTab === 'team' && 'Управління Командою'}

            {activeTab === 'partners' && 'Керування Партнерами'}

            {activeTab === 'donations' && 'Підтримка Діяльності'}

          </h2>

          {loading && <Loader2 className="animate-spin text-kmmr-blue" />}

        </div>



        {/* 1. SUBMISSIONS CRM */}

        {activeTab === 'submissions' && (

          <div className="space-y-4">

            {/* Toolbar */}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800">

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">

                <div className="flex flex-wrap gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                  <button 
                    onClick={() => { setSubmissionFilter('event'); setSelectedDynamicFilter('all'); }}
                    className={`px-3 py-2 rounded-md text-xs sm:text-sm font-bold transition-all ${submissionFilter === 'event' ? 'bg-white dark:bg-gray-700 shadow text-kmmr-blue dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                  >
                    Події
                  </button>
                  <button 
                    onClick={() => { setSubmissionFilter('opportunity'); setSelectedDynamicFilter('all'); }}
                    className={`px-3 py-2 rounded-md text-xs sm:text-sm font-bold transition-all ${submissionFilter === 'opportunity' ? 'bg-white dark:bg-gray-700 shadow text-kmmr-blue dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                  >
                    Можливості
                  </button>
                  <button 
                    onClick={() => { setSubmissionFilter('contact'); setSelectedDynamicFilter('all'); }}
                    className={`px-3 py-2 rounded-md text-xs sm:text-sm font-bold transition-all ${submissionFilter === 'contact' ? 'bg-white dark:bg-gray-700 shadow text-kmmr-blue dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                  >
                    Волонтери
                  </button>
                  <button 
                    onClick={() => { setSubmissionFilter('support'); setSelectedDynamicFilter('all'); }}
                    className={`px-3 py-2 rounded-md text-xs sm:text-sm font-bold transition-all ${submissionFilter === 'support' ? 'bg-white dark:bg-gray-700 shadow text-kmmr-blue dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                  >
                    Підтримка
                  </button>
                  <button 
                    onClick={() => { setSubmissionFilter('internship'); setSelectedDynamicFilter('all'); }}
                    className={`px-3 py-2 rounded-md text-xs sm:text-sm font-bold transition-all ${submissionFilter === 'internship' ? 'bg-white dark:bg-gray-700 shadow text-kmmr-blue dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                  >
                    Практика
                  </button>
                  <button 
                    onClick={() => { setSubmissionFilter('newsletter'); setSelectedDynamicFilter('all'); }}
                    className={`px-3 py-2 rounded-md text-xs sm:text-sm font-bold transition-all ${submissionFilter === 'newsletter' ? 'bg-white dark:bg-gray-700 shadow text-kmmr-blue dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                  >
                    Розсилка
                  </button>
                </div>

                

                {/* Dynamic Dropdown Filter */}

                {submissionFilter !== 'newsletter' && submissionFilter !== 'internship' && dynamicFilterOptions.length > 0 && (

                   <div className="relative w-full sm:w-auto">

                      <select 

                        value={selectedDynamicFilter}

                        onChange={(e) => setSelectedDynamicFilter(e.target.value)}

                        className="w-full appearance-none pl-4 pr-10 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:border-kmmr-blue focus:outline-none focus:ring-2 focus:ring-kmmr-blue/20 cursor-pointer sm:min-w-[200px]"

                      >

                         <option value="all">
                           {submissionFilter === 'contact' ? 'Всі департаменти' : 
                            submissionFilter === 'support' ? 'Всі типи підтримки' : 
                            'Всі події'}
                         </option>

                         {dynamicFilterOptions.map(opt => (

                           <option key={opt} value={opt}>
                             {submissionFilter === 'contact' ? (
                               departments.find(d => d.id === opt) ? (language === 'en' && departments.find(d => d.id === opt)?.nameEn ? departments.find(d => d.id === opt)?.nameEn : departments.find(d => d.id === opt)?.name) : opt
                             ) : opt}
                           </option>

                         ))}

                      </select>

                      <ChevronDown size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />

                   </div>

                )}

              </div>



              <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">

                 <button onClick={downloadExcel} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold text-sm transition-colors shadow-sm">

                    <Download size={16} /> <span className="hidden sm:inline">Експорт (CSV)</span>

                 </button>

                 <div className="text-sm text-gray-500 font-semibold px-2">

                    Всього: {filteredSubmissions.length}

                 </div>

              </div>

            </div>



            {/* Mobile View (Cards) */}

            <div className="md:hidden space-y-4">

              {filteredSubmissions.length === 0 ? (

                 <div className="p-8 text-center bg-white dark:bg-gray-900 rounded-xl text-gray-400 border border-gray-200 dark:border-gray-800">

                    <p>Заявки відсутні.</p>

                 </div>

              ) : (

                filteredSubmissions.map(sub => {

                  const date = sub.createdAt && typeof sub.createdAt === 'object' 

                                  ? new Date((sub.createdAt as any).seconds * 1000).toLocaleDateString() 

                                  : sub.createdAt;

                  

                  const isApp = (sub as any).formType === 'opportunity_application';

                  const isSupport = (sub as any).formType === 'initiative_support';

                  const isInternship = (sub as any).formType === 'internship_registration';



                  return (

                    <div 

                      key={sub.id} 

                      onClick={() => { if (submissionFilter !== 'newsletter') setSelectedApplication(sub); }}

                      className={`bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col gap-3 ${submissionFilter !== 'newsletter' ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors' : ''}`}

                    >

                       <div className="flex justify-between items-start">

                          <div>

                             <h4 className="font-bold text-gray-900 dark:text-white text-lg">{isSupport ? (sub as any).orgName : (sub.name || sub.email)}</h4>

                             <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1"><Clock size={12}/> {date}</div>

                          </div>

                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusColor(sub.status)}`}>{sub.status}</span>

                       </div>



                       <div className="border-t border-b border-gray-50 dark:border-gray-800 py-2">

                          {isApp ? (

                              <div className="text-sm">

                                <span className="text-xs font-bold text-kmmr-purple dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded mr-2">Реєстрація</span>

                                <span className="font-semibold text-gray-800 dark:text-gray-200">{(sub as any).opportunityTitle}</span>

                              </div>

                          ) : isSupport ? (

                               <div className="text-sm">

                                <span className="text-xs font-bold text-kmmr-green bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded mr-2">Підтримка</span>

                                <span className="font-semibold text-gray-800 dark:text-gray-200">{(sub as any).projectTitle}</span>

                              </div>

                          ) : submissionFilter === 'newsletter' ? (

                              <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded">Підписка на новини</span>

                          ) : (

                              <div className="text-sm">

                                <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded mr-2">Контакт</span>

                                <span className="font-semibold text-gray-700 dark:text-gray-300">{departments.find(d => d.id === sub.department)?.name || sub.department || 'Загальне питання'}</span>

                              </div>

                          )}

                       </div>



                       {submissionFilter !== 'newsletter' && (

                         <div className="grid grid-cols-2 gap-2 text-sm">

                            <a href={`mailto:${sub.email}`} className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-kmmr-blue truncate"><Mail size={14}/> {sub.email}</a>

                            <a href={`tel:${sub.phone}`} className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-kmmr-blue truncate"><Briefcase size={14}/> {sub.phone}</a>

                            {((sub as any).commTag || (sub as any).socialTag) && (

                              <div className="col-span-2 flex items-center gap-1 text-gray-600 dark:text-gray-400 truncate mt-1">

                                <Instagram size={14}/> {(sub as any).commTag || (sub as any).socialTag}

                              </div>

                            )}

                            {(sub as any).orgSocial && (

                              <div className="col-span-2 flex items-center gap-1 text-gray-600 dark:text-gray-400 truncate mt-1">

                                <span className="font-semibold text-xs">Соцмережі:</span> {(sub as any).orgSocial}

                              </div>

                            )}

                            {((sub as any).eventStartDate || (sub as any).eventEndDate) && (

                              <div className="col-span-2 flex items-center gap-1 text-gray-600 dark:text-gray-400 truncate mt-1 text-xs">

                                <span className="font-semibold">Дати:</span> {(sub as any).eventStartDate || (sub as any).eventDate || '...'} - {(sub as any).eventEndDate || '...'}

                              </div>

                            )}

                         </div>

                       )}



                       {/* Details Area */}

                       {submissionFilter !== 'newsletter' && (

                         <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-xs text-gray-700 dark:text-gray-300 mt-1">

                            {isSupport ? (

                               <div className="space-y-1">

                                  <div><span className="font-bold">Представник:</span> {(sub as any).repName}</div>

                                  <div className="italic line-clamp-3">"{(sub as any).description}"</div>

                               </div>

                            ) : (sub as any).answers ? (

                                <div className="space-y-1">

                                    {Object.entries((sub as any).answers).slice(0, 3).map(([key, val]) => (

                                        <div key={key} className="truncate">

                                            <span className="font-bold">{key.replace(/_/g, ' ')}:</span> {String(val)}

                                        </div>

                                    ))}

                                    {Object.keys((sub as any).answers).length > 3 && <div className="text-gray-400 italic">...більше полів (експорт)</div>}

                                </div>

                            ) : (

                                <div className="italic">"{sub.motivation}"</div>

                            )}

                         </div>

                       )}



                       <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">

                          <button onClick={(e) => { e.stopPropagation(); updateStatus(sub.id, 'contacted'); }} className="p-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-lg"><Clock size={18}/></button>

                          <button onClick={(e) => { e.stopPropagation(); updateStatus(sub.id, 'approved'); }} className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg"><CheckCircle size={18}/></button>

                          <button onClick={(e) => { e.stopPropagation(); updateStatus(sub.id, 'rejected'); }} className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg"><XCircle size={18}/></button>

                          <button onClick={(e) => { e.stopPropagation(); deleteItem('submissions', sub.id); }} className="p-2 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-red-500 rounded-lg"><Trash2 size={18}/></button>

                       </div>

                    </div>

                  );

                })

              )}

            </div>



            {/* Desktop Table */}

            <div className="hidden md:block bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden overflow-x-auto">

               {/* --- NEWSLETTER TABLE --- */}

               {submissionFilter === 'newsletter' ? (

                 filteredSubmissions.length === 0 ? (

                   <div className="p-12 text-center flex flex-col items-center text-gray-400">

                      <Mail className="w-12 h-12 mb-2 opacity-50"/>

                      <p>Підписників розсилки поки немає.</p>

                   </div>

                 ) : (

                   <table className="w-full text-left min-w-[600px]">

                      <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">

                        <tr>

                          <th className="p-4 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase">ID</th>

                          <th className="p-4 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase">Email</th>

                          <th className="p-4 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase">Дата підписки</th>

                          <th className="p-4 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase">Дії</th>

                        </tr>

                      </thead>

                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">

                        {filteredSubmissions.map((sub, idx) => (

                          <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">

                            <td className="p-4 text-sm font-bold text-gray-400">#{idx + 1}</td>

                            <td className="p-4">

                              <div className="font-bold text-gray-800 dark:text-gray-200">{sub.email}</div>

                            </td>

                            <td className="p-4 text-sm text-gray-500 dark:text-gray-400">

                              {sub.createdAt && typeof sub.createdAt === 'object' 

                                ? new Date((sub.createdAt as any).seconds * 1000).toLocaleString('uk-UA') 

                                : sub.createdAt || '-'}

                            </td>

                            <td className="p-4">

                              <button onClick={() => deleteItem('submissions', sub.id)} title="Видалити" className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"><Trash2 size={18}/></button>

                            </td>

                          </tr>

                        ))}

                      </tbody>

                   </table>

                 )

               ) : (

                 /* --- EXISTING SUBMISSIONS TABLE --- */

                 filteredSubmissions.length === 0 ? (

                   <div className="p-12 text-center flex flex-col items-center text-gray-400">

                      <Search className="w-12 h-12 mb-2 opacity-50"/>

                      <p>Заявки відсутні в цій категорії.</p>

                   </div>

                 ) : (

                  <table className="w-full text-left min-w-[900px]">

                    <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">

                      <tr>

                        <th className="p-4 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase">Ім'я / Організація / Дата</th>

                        <th className="p-4 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase">Тип заявки</th>

                        <th className="p-4 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase">Контакти</th>

                        <th className="p-4 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase">Деталі</th>

                        <th className="p-4 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase">Статус</th>

                        <th className="p-4 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase">Дії</th>

                      </tr>

                    </thead>

                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">

                      {filteredSubmissions.map(sub => {

                        const isSupport = (sub as any).formType === 'initiative_support';

                        const isInternship = (sub as any).formType === 'internship_registration';

                        return (

                        <tr 

                           key={sub.id} 

                           onClick={() => { setSelectedApplication(sub); }}

                           className={`border-b border-gray-50 dark:border-gray-800 last:border-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors`}

                        >

                          <td className="p-4">

                            <div className="font-bold text-gray-800 dark:text-gray-200">{isSupport ? (sub as any).orgName : sub.name}</div>

                            <div className="text-xs text-gray-500 dark:text-gray-400">

                              {sub.createdAt && typeof sub.createdAt === 'object' 

                                ? new Date((sub.createdAt as any).seconds * 1000).toLocaleDateString() 

                                : sub.createdAt}

                            </div>

                          </td>

                          <td className="p-4">

                              {(sub as any).formType === 'opportunity_application' ? (

                                  <div className="flex flex-col">

                                      <span className="text-[10px] font-black uppercase tracking-wider text-kmmr-purple dark:text-purple-300 bg-purple-50 dark:bg-[#D7269B]/20 px-2 py-0.5 rounded w-fit mb-1">Реєстрація</span>

                                      <span className="text-sm font-bold text-gray-800 dark:text-gray-200 leading-tight">{(sub as any).opportunityTitle}</span>

                                      <span className="text-xs text-gray-500 dark:text-gray-400">{(sub as any).type}</span>

                                  </div>

                              ) : isInternship ? (

                                  <div className="flex flex-col">

                                      <span className="text-[10px] font-black uppercase tracking-wider text-kmmr-blue dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded w-fit mb-1">Практика</span>

                                      <span className="text-sm font-bold text-gray-800 dark:text-gray-200 leading-tight">{(sub as any).university}</span>

                                      <span className="text-xs text-gray-500 dark:text-gray-400">{(sub as any).specialization}</span>

                                  </div>

                              ) : isSupport ? (

                                  <div className="flex flex-col">

                                      <span className="text-[10px] font-black uppercase tracking-wider text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded w-fit mb-1">Підтримка</span>

                                      <span className="text-sm font-bold text-gray-800 dark:text-gray-200 leading-tight">{(sub as any).projectTitle}</span>

                                  </div>

                              ) : (

                                  <div className="flex flex-col">

                                      <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded w-fit mb-1">Контакт</span>

                                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{departments.find(d => d.id === sub.department)?.name || sub.department || 'Загальне питання'}</span>

                                  </div>

                              )}

                          </td>

                          <td className="p-4">

                            <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{sub.email}</div>

                            <div className="text-sm text-gray-500 dark:text-gray-400">{sub.phone}</div>

                            {((sub as any).commTag || (sub as any).socialTag) && (

                              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">

                                <Instagram size={12}/> {(sub as any).commTag || (sub as any).socialTag}

                              </div>

                            )}

                            {(sub as any).orgSocial && (

                              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">

                                <span className="font-semibold text-xs">Соцмережі:</span> {(sub as any).orgSocial}

                              </div>

                            )}

                            {((sub as any).eventStartDate || (sub as any).eventEndDate) && (

                              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">

                                <span className="font-semibold">Дати:</span> {(sub as any).eventStartDate || (sub as any).eventDate || '...'} - {(sub as any).eventEndDate || '...'}

                              </div>

                            )}

                          </td>

                          <td className="p-4">

                              {isSupport ? (

                                 <div className="text-xs text-gray-600 dark:text-gray-400 max-w-xs space-y-1">

                                    <div><span className="font-bold">Представник:</span> {(sub as any).repName}</div>

                                    <div className="truncate" title={(sub as any).description}><span className="font-bold">Опис:</span> {(sub as any).description}</div>

                                    <div className="truncate" title={(sub as any).supportType}><span className="font-bold">Потреба:</span> {(sub as any).supportType}</div>

                                 </div>

                              ) : (sub as any).answers ? (

                                  <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400 max-w-xs">

                                      {Object.entries((sub as any).answers).map(([key, val]) => (

                                          <div key={key} className="truncate group relative cursor-help">

                                              <span className="font-bold text-gray-700 dark:text-gray-300">{key.replace(/_/g, ' ')}:</span> {String(val)}

                                          </div>

                                      ))}

                                  </div>

                              ) : (

                                  <div className="text-xs text-gray-600 dark:text-gray-400 max-w-xs line-clamp-3 italic" title={sub.motivation}>"{sub.motivation}"</div>

                              )}

                          </td>

                          <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(sub.status)}`}>{sub.status}</span></td>

                          <td className="p-4">

                            <div className="flex gap-2">

                              <button onClick={(e) => { e.stopPropagation(); updateStatus(sub.id, 'contacted'); }} title="Зв'язались" className="p-1 text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded"><Clock size={18}/></button>

                              <button onClick={(e) => { e.stopPropagation(); updateStatus(sub.id, 'approved'); }} title="Прийнято" className="p-1 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"><CheckCircle size={18}/></button>

                              <button onClick={(e) => { e.stopPropagation(); updateStatus(sub.id, 'rejected'); }} title="Відхилено" className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"><XCircle size={18}/></button>

                              <button type="button" data-no-dnd="true" onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteItem('submissions', sub.id); }} title="Видалити" className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded cursor-pointer"><Trash2 size={18}/></button>

                            </div>

                          </td>

                        </tr>

                      )})}

                    </tbody>

                  </table>

                 )

               )}

            </div>

          </div>

        )}



        {/* 2. DOCUMENTS MANAGER */}

        {activeTab === 'docs' && (

          <div className="space-y-6">

             <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 flex flex-col items-center justify-center border-dashed border-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors relative">

               <input 

                 type="file" 

                 onChange={handleAddDocument}

                 className="absolute inset-0 opacity-0 cursor-pointer"

               />

               <Download className="text-kmmr-blue dark:text-blue-400 w-12 h-12 mb-2" />

               <h3 className="font-bold text-kmmr-blue dark:text-blue-300">Завантажити новий документ</h3>

               <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">PDF, DOCX (Max 10MB)</p>

               <span className="bg-kmmr-blue text-white px-6 py-2 rounded-lg font-bold">Оберіть файл</span>

            </div>

            

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {documents.map((doc, index) => (

                <div 

                  key={doc.id} 

                  draggable

                  onDragStart={() => handleDragStartDoc(index)}

                  onDragOver={handleDragOver}

                  onDrop={() => handleDropDoc(index)}

                  className={`bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-3 cursor-move transition-all relative ${draggedDocIndex === index ? 'opacity-50 border-dashed border-kmmr-blue' : ''}`}

                >

                  <div className="text-gray-300 dark:text-gray-600 hidden md:block"><GripVertical size={20}/></div>

                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center shrink-0">

                    <FileText className="text-gray-500 dark:text-gray-400" />

                  </div>

                  <div className="flex-grow min-w-0">

                    <h3 className="font-bold text-gray-800 dark:text-gray-200 truncate" title={doc.title}>{doc.title}</h3>

                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{doc.date} • {doc.size}</p>

                    <a href={doc.link} target="_blank" rel="noreferrer" className="text-xs text-kmmr-blue dark:text-blue-400 hover:underline mt-1 inline-block font-medium">Завантажити</a>

                  </div>

                  

                  {/* Action Buttons Area */}

                  <div className="flex flex-col gap-1 items-center pl-3 border-l border-gray-100 dark:border-gray-800">

                     <button 

                        type="button"

                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); moveItem(index, 'up', documents, setDocuments, 'documents'); }} 

                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-400 hover:text-kmmr-blue"

                     >

                        <ChevronUp size={16}/>

                     </button>

                     

                     <button 

                        type="button"

                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); moveItem(index, 'down', documents, setDocuments, 'documents'); }} 

                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-400 hover:text-kmmr-blue"

                     >

                        <ChevronDown size={16}/>

                     </button>

                     

                     {/* Видима кнопка видалення */}

                     <button 

                        type="button" 

                        data-no-dnd="true"

                        onClick={(e) => { 

                           e.preventDefault(); 

                           e.stopPropagation(); 

                           handleDeleteDocument(doc.id, doc.link); 

                        }} 

                        className="p-1 mt-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors z-50 cursor-pointer"

                        title="Видалити документ"

                     >

                        <Trash2 size={16} />

                     </button>

                  </div>

                </div>

              ))}

            </div>

          </div>

        )}



        {/* 3. PROJECTS */}

        {activeTab === 'projects' && (

           <div className="space-y-6">

             {isAddingProject && (

              <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg border border-kmmr-pink/20 dark:border-kmmr-pink/10 mb-6 animate-fade-in-up">

                 <div className="flex justify-between items-start mb-6">
                   <h3 className="font-bold text-xl text-kmmr-blue dark:text-blue-400">Додати/Редагувати Проєкт</h3>
                   <button onClick={() => { setIsAddingProject(false); setNewProject({}); setFileToUpload(null); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><XCircle size={24}/></button>
                </div>

                <form onSubmit={handleAddProject} className="space-y-6">
                    <div className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-2 overflow-x-auto">
                     <span className="text-sm font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1 whitespace-nowrap"><Languages size={16}/> Мова контенту:</span>
                     <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg shrink-0">
                        <button type="button" onClick={() => setProjectLang('uk')} className={`px-3 py-1 rounded-md text-sm font-bold transition-all ${projectLang === 'uk' ? 'bg-white dark:bg-gray-700 shadow text-kmmr-blue dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>UA</button>
                        <button type="button" onClick={() => setProjectLang('en')} className={`px-3 py-1 rounded-md text-sm font-bold transition-all ${projectLang === 'en' ? 'bg-white dark:bg-gray-700 shadow text-kmmr-blue dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>EN</button>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                     <div className="space-y-4">

                        {projectLang === 'uk' ? (

                          <>

                            <div><label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Назва (UA)</label><input className="border dark:border-gray-700 p-2 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={newProject.title || ''} onChange={e => setNewProject({...newProject, title: e.target.value})} required /></div>

                            <div><label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Короткий опис</label><textarea className="border dark:border-gray-700 p-2 rounded w-full h-24 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={newProject.description || ''} onChange={e => setNewProject({...newProject, description: e.target.value})} required /></div>

                            <div><label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Повний опис</label><textarea className="border dark:border-gray-700 p-2 rounded w-full h-40 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={newProject.fullDescription || ''} onChange={e => setNewProject({...newProject, fullDescription: e.target.value})} /></div>

                          </>

                        ) : (

                          <>

                             <div><label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Title (EN)</label><input className="border dark:border-gray-700 p-2 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={newProject.titleEn || ''} onChange={e => setNewProject({...newProject, titleEn: e.target.value})} /></div>

                             <div><label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Short Desc (EN)</label><textarea className="border dark:border-gray-700 p-2 rounded w-full h-24 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={newProject.descriptionEn || ''} onChange={e => setNewProject({...newProject, descriptionEn: e.target.value})} /></div>

                             <div><label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Full Desc (EN)</label><textarea className="border dark:border-gray-700 p-2 rounded w-full h-40 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={newProject.fullDescriptionEn || ''} onChange={e => setNewProject({...newProject, fullDescriptionEn: e.target.value})} /></div>

                          </>

                        )}

                     </div>

                     <div className="space-y-4">

                        <div className="grid grid-cols-2 gap-4">

                           <div><label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Текстова дата</label><input className="border dark:border-gray-700 p-2 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={newProject.date || ''} onChange={e => setNewProject({...newProject, date: e.target.value})} /></div>

                           <div><label className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase block mb-1">Дедлайн реєстрації</label><input className="border dark:border-gray-700 p-2 rounded w-full text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" type="date" value={newProject.deadline || ''} onChange={e => setNewProject({...newProject, deadline: e.target.value})} /></div>

                        </div>

                        

                        {/* Ownership Type */}

                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">

                           <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase block mb-2">Тип власності проєкту</label>

                           <div className="flex flex-col gap-2 text-gray-700 dark:text-gray-300">

                              <label className="flex items-center gap-2 text-sm cursor-pointer">

                                 <input type="radio" name="ownership" checked={!newProject.ownershipType || newProject.ownershipType === 'own'} onChange={() => setNewProject({...newProject, ownershipType: 'own'})} />

                                 Наш проект

                              </label>

                              <label className="flex items-center gap-2 text-sm cursor-pointer">

                                 <input type="radio" name="ownership" checked={newProject.ownershipType === 'support'} onChange={() => setNewProject({...newProject, ownershipType: 'support'})} />

                                 За нашої підтримки

                              </label>

                              <label className="flex items-center gap-2 text-sm cursor-pointer">

                                 <input type="radio" name="ownership" checked={newProject.ownershipType === 'partner'} onChange={() => setNewProject({...newProject, ownershipType: 'partner'})} />

                                 Інша організація

                              </label>

                           </div>

                           {newProject.ownershipType === 'partner' && (

                              <div className="mt-2 animate-fade-in-up">

                                 <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Назва організації</label>

                                 <input className="border dark:border-gray-700 p-2 rounded w-full text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={newProject.partnerName || ''} onChange={e => setNewProject({...newProject, partnerName: e.target.value})} placeholder="Назва партнера" />

                              </div>

                           )}

                        </div>



                        <div><label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Instagram Link</label><input className="border dark:border-gray-700 p-2 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={newProject.instagramLink || ''} onChange={e => setNewProject({...newProject, instagramLink: e.target.value})} /></div>

                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 p-4 rounded-xl text-center"><label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase block mb-2">Обкладинка (Фото)</label><input type="file" onChange={e => setFileToUpload(e.target.files ? e.target.files[0] : null)} className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#D7269B]/10 file:text-[#D7269B] hover:file:bg-[#D7269B]/20 dark:file:bg-[#D7269B]/20 dark:file:text-[#D7269B] dark:hover:file:bg-[#D7269B]/30"/></div>

                     </div>

                  </div>

                   <div className="border-t border-gray-200 dark:border-gray-800 pt-6">

                       <h4 className="font-bold text-lg flex items-center gap-2 text-gray-800 dark:text-gray-200 mb-4"><List size={20}/> Налаштування реєстрації</h4>

                       

                       <div className="space-y-4">

                         <div className="flex flex-col gap-2">
                           <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                              <div>
                                <div className="font-bold text-gray-800 dark:text-gray-200">Внутрішня анкета КММР</div>
                                <div className="text-xs text-gray-500">Користувачі заповнюватимуть форму прямо на сайті</div>
                              </div>
                              <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
                                 <input 
                                    type="checkbox" 
                                    checked={newProject.hasRegistration !== false && !newProject.googleFormLink} 
                                    onChange={(e) => {
                                       if (e.target.checked) {
                                           setNewProject({...newProject, hasRegistration: true, googleFormLink: ''});
                                       } else {
                                           setNewProject({...newProject, hasRegistration: false});
                                       }
                                    }}
                                    className="w-4 h-4 text-kmmr-blue rounded focus:ring-kmmr-blue"
                                  />
                                 <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Увімкнути</span>
                              </label>
                           </div>
                           
                           {newProject.hasRegistration !== false && !newProject.googleFormLink && (
                             <AdminFormBuilder 
                               questions={newProject.questions || []} 
                               onChange={(questions) => setNewProject({ ...newProject, questions })} 
                             />
                           )}
                         </div>



                         <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">

                            <div>

                              <div className="font-bold text-gray-800 dark:text-gray-200">Google Форма</div>

                              <div className="text-xs text-gray-500">Перенаправлення на зовнішню форму</div>

                            </div>

                            <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">

                               <input 

                                  type="checkbox" 

                                  checked={newProject.hasRegistration !== false && !!newProject.googleFormLink} 

                                  onChange={(e) => {

                                     if (e.target.checked) {

                                         setNewProject({...newProject, hasRegistration: true, googleFormLink: newProject.googleFormLink || 'https://forms.gle/'});

                                     } else {

                                         setNewProject({...newProject, hasRegistration: false, googleFormLink: ''});

                                     }

                                  }}

                                  className="w-4 h-4 text-kmmr-blue rounded focus:ring-kmmr-blue"

                                />

                               <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Увімкнути</span>

                            </label>

                         </div>

                       </div>

                       

                       {newProject.hasRegistration !== false && !!newProject.googleFormLink && (

                         <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800/30">

                            <label className="text-xs font-bold text-kmmr-blue dark:text-blue-400 uppercase block mb-2">Посилання на Google Форму</label>

                            <input 

                               className="border border-blue-200 dark:border-blue-800 p-2 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-kmmr-blue outline-none" 

                               value={newProject.googleFormLink || ''} 

                               onChange={e => setNewProject({...newProject, googleFormLink: e.target.value})} 

                               placeholder="https://forms.gle/..."

                            />

                         </div>

                       )}

                  </div>

                  <div className="flex gap-2 pt-4 border-t border-gray-100">

                    <button type="submit" disabled={loading} className="bg-kmmr-green text-white px-6 py-3 rounded-lg font-bold hover:bg-opacity-90 flex items-center gap-2">{loading ? <Loader2 className="animate-spin"/> : <Save size={18} />} Зберегти</button>

                    <button type="button" onClick={() => { setIsAddingProject(false); setNewProject({}); setFileToUpload(null); }} className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white border border-transparent dark:border-gray-700 px-6 py-3 rounded-lg font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Скасувати</button>

                  </div>

                </form>

              </div>

             )}

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

               <div onClick={() => { setNewProject({}); setFileToUpload(null); setIsAddingProject(true); }} className="bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center h-96 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group">

                 <Plus className="w-8 h-8 text-kmmr-blue dark:text-blue-400" /><span className="font-bold text-gray-500 dark:text-gray-400 text-lg mt-2">Створити Проєкт</span>

               </div>

               {projects.map((project, index) => (

                 <div 

                   key={project.id} 

                   draggable

                   onDragStart={() => handleDragStartProject(index)}

                   onDragOver={handleDragOver}

                   onDrop={() => handleDropProject(index)}

                   className={`bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-all cursor-move ${draggedProjectIndex === index ? 'opacity-50 border-dashed border-kmmr-blue' : ''}`}

                 >

                   <div className="h-48 bg-gray-200 dark:bg-gray-800 relative group">

                     <div className="absolute top-2 right-2 z-10 p-1 bg-black/30 rounded text-white hidden md:block"><GripVertical size={16}/></div>

                     <img src={project.image} alt="" className="w-full h-full object-cover" />

                   </div>

                   <div className="p-5 flex-grow">

                     <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2 line-clamp-1">{project.title}</h3>

                     <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3">{project.description}</p>

                   </div>

                   <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 flex justify-between items-center">

                      <div className="flex items-center gap-2">

                         <button onClick={() => moveItem(index, 'up', projects, setProjects, 'projects')} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-400 hover:text-kmmr-blue"><ChevronUp size={16}/></button>

                         <button onClick={() => moveItem(index, 'down', projects, setProjects, 'projects')} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-400 hover:text-kmmr-blue"><ChevronDown size={16}/></button>

                      </div>

                      <div className="flex items-center gap-2">

                        <button onClick={() => { setNewProject(project); setIsAddingProject(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-kmmr-blue dark:text-blue-400 text-xs font-bold hover:underline flex items-center gap-1"><Edit2 size={14}/> Ред</button>

                        <button type="button" data-no-dnd="true" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteProject(project.id); }} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors cursor-pointer z-50"><Trash2 size={14} className="text-red-500" /></button>

                      </div>

                   </div>

                 </div>

               ))}

             </div>

           </div>

        )}



        {/* 4. OPPORTUNITIES */}

        {activeTab === 'opportunities' && (

          <div className="space-y-6">

              {isAddingOpp && (

               <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl border border-kmmr-blue/20 dark:border-blue-500/20 mb-6 animate-fade-in-up">

                 <div className="flex justify-between items-start mb-6"><h3 className="font-bold text-xl text-kmmr-blue dark:text-blue-400">Конструктор Можливості</h3><button onClick={() => setIsAddingOpp(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><XCircle size={24}/></button></div>

                 <form onSubmit={handleSaveOpportunity} className="space-y-6">

                    <div className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-2">

                         <span className="text-sm font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1"><Languages size={16}/> Мова контенту:</span>

                         <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">

                            <button type="button" onClick={() => setOppLang('uk')} className={`px-3 py-1 rounded-md text-sm font-bold transition-all ${oppLang === 'uk' ? 'bg-white dark:bg-gray-700 shadow text-kmmr-blue dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>UA</button>

                            <button type="button" onClick={() => setOppLang('en')} className={`px-3 py-1 rounded-md text-sm font-bold transition-all ${oppLang === 'en' ? 'bg-white dark:bg-gray-700 shadow text-kmmr-blue dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>EN</button>

                         </div>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">

                       <div className="space-y-2"><label className="text-sm font-bold text-gray-700 dark:text-gray-300">Заголовок ({oppLang})</label>

                          {oppLang === 'uk' ? <input className="w-full border dark:border-gray-700 p-2 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" value={newOpp.title || ''} onChange={e => setNewOpp({...newOpp, title: e.target.value})} required /> 

                                             : <input className="w-full border dark:border-gray-700 p-2 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" value={newOpp.titleEn || ''} onChange={e => setNewOpp({...newOpp, titleEn: e.target.value})} />}

                       </div>

                       <div className="space-y-2"><label className="text-sm font-bold text-gray-700 dark:text-gray-300">Опис ({oppLang})</label>

                          {oppLang === 'uk' ? <input className="w-full border dark:border-gray-700 p-2 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" value={newOpp.description || ''} onChange={e => setNewOpp({...newOpp, description: e.target.value})} /> 

                                             : <input className="w-full border dark:border-gray-700 p-2 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" value={newOpp.descriptionEn || ''} onChange={e => setNewOpp({...newOpp, descriptionEn: e.target.value})} />}

                       </div>

                       <div className="space-y-2"><label className="text-sm font-bold text-gray-700 dark:text-gray-300">Тип</label><select className="w-full border dark:border-gray-700 p-2 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" value={newOpp.type} onChange={e => setNewOpp({...newOpp, type: e.target.value as any})}><option value="Volunteering">Волонтерство</option><option value="Event">Подія</option><option value="Education">Навчання</option><option value="Job">Робота</option></select></div>

                       <div className="space-y-2"><label className="text-sm font-bold text-gray-700 dark:text-gray-300">Дедлайн (Залиште пустим для постійного набору)</label><input className="w-full border dark:border-gray-700 p-2 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" type="date" value={newOpp.deadline || ''} onChange={e => setNewOpp({...newOpp, deadline: e.target.value})} /></div>

                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-800 pt-6">

                       <h4 className="font-bold text-lg flex items-center gap-2 text-gray-800 dark:text-gray-200 mb-4"><List size={20}/> Налаштування реєстрації</h4>

                       

                       <div className="space-y-4">

                         <div className="flex flex-col gap-2">
                           <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                              <div>
                                <div className="font-bold text-gray-800 dark:text-gray-200">Внутрішня анкета КММР</div>
                                <div className="text-xs text-gray-500">Користувачі заповнюватимуть форму прямо на сайті</div>
                              </div>
                              <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
                                 <input 
                                    type="checkbox" 
                                    checked={newOpp.hasRegistration !== false && !newOpp.googleFormLink} 
                                    onChange={(e) => {
                                       if (e.target.checked) {
                                           setNewOpp({...newOpp, hasRegistration: true, googleFormLink: ''});
                                       } else {
                                           setNewOpp({...newOpp, hasRegistration: false});
                                       }
                                    }}
                                    className="w-4 h-4 text-kmmr-blue rounded focus:ring-kmmr-blue"
                                  />
                                 <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Увімкнути</span>
                              </label>
                           </div>
                           
                           {newOpp.hasRegistration !== false && !newOpp.googleFormLink && (
                             <AdminFormBuilder 
                               questions={newOpp.questions || []} 
                               onChange={(questions) => setNewOpp({ ...newOpp, questions })} 
                             />
                           )}
                         </div>



                         <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">

                            <div>

                              <div className="font-bold text-gray-800 dark:text-gray-200">Google Форма</div>

                              <div className="text-xs text-gray-500">Перенаправлення на зовнішню форму</div>

                            </div>

                            <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">

                               <input 

                                  type="checkbox" 

                                  checked={newOpp.hasRegistration !== false && !!newOpp.googleFormLink} 

                                  onChange={(e) => {

                                     if (e.target.checked) {

                                         setNewOpp({...newOpp, hasRegistration: true, googleFormLink: newOpp.googleFormLink || 'https://forms.gle/'});

                                     } else {

                                         setNewOpp({...newOpp, hasRegistration: false, googleFormLink: ''});

                                     }

                                  }}

                                  className="w-4 h-4 text-kmmr-blue rounded focus:ring-kmmr-blue"

                                />

                               <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Увімкнути</span>

                            </label>

                         </div>

                       </div>

                       

                       {newOpp.hasRegistration !== false && !!newOpp.googleFormLink && (

                         <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800/30">

                            <label className="text-xs font-bold text-kmmr-blue dark:text-blue-400 uppercase block mb-2">Посилання на Google Форму</label>

                            <input 

                               className="border border-blue-200 dark:border-blue-800 p-2 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-kmmr-blue outline-none" 

                               value={newOpp.googleFormLink || ''} 

                               onChange={e => setNewOpp({...newOpp, googleFormLink: e.target.value})} 

                               placeholder="https://forms.gle/..."

                            />

                         </div>

                       )}

                    </div>

                    <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">

                       <button type="submit" disabled={loading} className="bg-kmmr-green text-white px-6 py-3 rounded-lg font-bold shadow-lg w-full flex justify-center items-center gap-2">{loading ? <Loader2 className="animate-spin" /> : <Save size={20} />} {newOpp.id ? 'Зберегти зміни' : 'Створити Можливість'}</button>

                    </div>

                 </form>

               </div>

             )}

             <div className="grid grid-cols-1 gap-4">

                 <div onClick={() => { setIsAddingOpp(true); setNewOpp({ type: 'Volunteering' }); }} className="bg-white dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">

                     <Plus className="w-12 h-12 text-gray-400 mb-2" /><span className="font-bold text-gray-600 dark:text-gray-400">Створити Нову Можливість</span>

                 </div>

                 {opportunities.map(opp => (

                    <div key={opp.id} className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">

                       <div>

                          <div className="flex items-center gap-2 mb-1">

                             <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${opp.type === 'Volunteering' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : opp.type === 'Event' ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>{opp.type}</span>

                             <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={12}/> Дедлайн: {opp.deadline || 'Постійний'}</span>

                          </div>

                          <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">{opp.title}</h3>

                       </div>

                       <div className="flex items-center gap-2">

                          <button onClick={() => { setNewOpp(opp); setIsAddingOpp(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex items-center gap-1 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-kmmr-blue dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 font-bold text-sm"><Edit2 size={16} /> Ред</button>

                          <button type="button" data-no-dnd="true" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteOpportunity(opp.id); }} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors cursor-pointer z-50"><Trash2 size={16} className="text-red-500" /></button>

                       </div>

                    </div>

                 ))}

             </div>

          </div>

        )}

        

        {/* 5. TEAM MANAGER */}

        {activeTab === 'team' && (

           <div className="space-y-6">

             {/* Toggle between Members and Departments */}

             <div className="flex flex-col sm:flex-row gap-4 mb-4">

                <button 

                  onClick={() => setShowDeptManager(false)} 

                  className={`px-4 py-2 rounded-lg font-bold transition-all ${!showDeptManager ? 'bg-kmmr-blue text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}

                >

                  Учасники команди

                </button>

                <button 

                  onClick={() => setShowDeptManager(true)} 

                  className={`px-4 py-2 rounded-lg font-bold transition-all ${showDeptManager ? 'bg-kmmr-blue text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}

                >

                  Керування Департаментами

                </button>

             </div>



             {/* DEPARTMENT MANAGER VIEW */}

             {showDeptManager ? (

               <div className="space-y-6">

                  {isAddingDept && (

                     <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl border border-kmmr-blue/20 dark:border-blue-500/20 mb-6 animate-fade-in-up">

                         <div className="flex justify-between items-start mb-6">

                           <h3 className="font-bold text-xl text-kmmr-blue dark:text-blue-400">Додати/Редагувати Департамент</h3>

                           <button onClick={() => setIsAddingDept(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><XCircle size={24}/></button>

                        </div>

                        <form onSubmit={handleSaveDepartment} className="space-y-6">

                           <div className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-2">

                               <span className="text-sm font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1"><Languages size={16}/> Мова контенту:</span>

                               <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">

                                  <button type="button" onClick={() => setDeptLang('uk')} className={`px-3 py-1 rounded-md text-sm font-bold transition-all ${deptLang === 'uk' ? 'bg-white dark:bg-gray-700 shadow text-kmmr-blue dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>UA</button>

                                  <button type="button" onClick={() => setDeptLang('en')} className={`px-3 py-1 rounded-md text-sm font-bold transition-all ${deptLang === 'en' ? 'bg-white dark:bg-gray-700 shadow text-kmmr-blue dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>EN</button>

                               </div>

                           </div>



                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                              <div className="space-y-4">

                                 {deptLang === 'uk' ? (

                                    <>

                                       <div><label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Назва (UA)</label><input className="border dark:border-gray-700 p-2 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={newDept.name || ''} onChange={e => setNewDept({...newDept, name: e.target.value})} required placeholder="Секретаріат" /></div>

                                       <div><label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Підпис (UA)</label><textarea className="border dark:border-gray-700 p-2 rounded w-full h-24 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={newDept.description || ''} onChange={e => setNewDept({...newDept, description: e.target.value})} placeholder="Серце структури..." /></div>

                                    </>

                                 ) : (

                                    <>

                                       <div><label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Name (EN)</label><input className="border dark:border-gray-700 p-2 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={newDept.nameEn || ''} onChange={e => setNewDept({...newDept, nameEn: e.target.value})} /></div>

                                       <div><label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Subtitle (EN)</label><textarea className="border dark:border-gray-700 p-2 rounded w-full h-24 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={newDept.descriptionEn || ''} onChange={e => setNewDept({...newDept, descriptionEn: e.target.value})} /></div>

                                    </>

                                 )}

                              </div>

                              <div className="space-y-4">

                                 <div>

                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">Колір фону іконки</label>

                                    <div className="flex items-center gap-4">

                                       <input 

                                          type="color" 

                                          className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer p-0" 

                                          value={newDept.color || '#031B47'} 

                                          onChange={e => setNewDept({...newDept, color: e.target.value})} 

                                       />

                                       <input 

                                          type="text" 

                                          className="border dark:border-gray-700 p-2 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" 

                                          value={newDept.color || '#031B47'} 

                                          onChange={e => setNewDept({...newDept, color: e.target.value})} 

                                       />

                                    </div>

                                 </div>

                                 <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 p-4 rounded-xl text-center">

                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase block mb-2">Іконка (SVG/PNG)</label>

                                    <input type="file" onChange={e => setFileToUpload(e.target.files ? e.target.files[0] : null)} className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#D7269B]/10 file:text-[#D7269B] hover:file:bg-[#D7269B]/20 dark:file:bg-[#D7269B]/20 dark:file:text-[#D7269B] dark:hover:file:bg-[#D7269B]/30"/>

                                    {newDept.icon && typeof newDept.icon === 'string' && (

                                       <div className="mt-2 flex justify-center">

                                          <div style={{ backgroundColor: newDept.color }} className="p-3 rounded-lg inline-flex">

                                             <img src={newDept.icon} className="w-8 h-8 object-contain" alt="icon preview"/>

                                          </div>

                                       </div>

                                    )}

                                 </div>

                              </div>

                           </div>

                           <button type="submit" disabled={loading} className="bg-kmmr-green text-white px-6 py-3 rounded-lg font-bold shadow-lg w-full flex justify-center items-center gap-2">{loading ? <Loader2 className="animate-spin" /> : <Save size={20} />} Зберегти Департамент</button>

                        </form>

                     </div>

                 )}



                 <div onClick={() => { setNewDept({ color: '#031B47' }); setFileToUpload(null); setIsAddingDept(true); }} className="bg-white dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 flex items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">

                     <Plus className="w-6 h-6 text-gray-400 mr-2" />

                     <span className="font-bold text-gray-600 dark:text-gray-400">Створити Новий Департамент</span>

                 </div>



                 {/* Departments List with Drag and Drop */}

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                     {departments.map((dept, index) => (

                        <div 

                           key={dept.id} 

                           draggable

                           onDragStart={() => handleDragStartDept(index)}

                           onDragOver={handleDragOver}

                           onDrop={() => handleDropDept(index)}

                           className={`bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-start gap-4 cursor-move transition-all ${draggedDeptIndex === index ? 'opacity-50 border-dashed border-kmmr-blue' : ''}`}

                        >

                           <div className="mt-2 text-gray-300 dark:text-gray-600 hidden md:block"><GripVertical size={20}/></div>

                           <div style={{ backgroundColor: dept.color }} className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0">

                              {dept.icon && <img src={dept.icon} alt="" className="w-6 h-6 object-contain invert-0 brightness-0 invert" style={{ filter: 'brightness(0) invert(1)' }} />}

                           </div>

                           <div className="flex-grow min-w-0">

                              <h3 className="font-bold text-gray-800 dark:text-gray-200">{dept.name}</h3>

                              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{dept.description}</p>

                           </div>

                           <div className="flex flex-col gap-1 items-center">

                              <button onClick={() => moveItem(index, 'up', departments, setDepartments, 'departments')} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-400 hover:text-kmmr-blue"><ChevronUp size={16}/></button>

                              <button onClick={() => moveItem(index, 'down', departments, setDepartments, 'departments')} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-400 hover:text-kmmr-blue"><ChevronDown size={16}/></button>

                           </div>

                           <div className="flex flex-col gap-2">

                              <button onClick={() => { setNewDept(dept); setIsAddingDept(true); window.scrollTo({top:0, behavior:'smooth'}); }} className="text-kmmr-blue dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-1 rounded"><Edit2 size={16}/></button>

                              <button type="button" data-no-dnd="true" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteDepartment(dept.id); }} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors cursor-pointer z-50"><Trash2 size={16} className="text-red-500" /></button>

                           </div>

                        </div>

                     ))}

                 </div>

               </div>

             ) : (

               /* ... (Team Members View) ... */

                <div className="space-y-6">

                  {/* Filter Toolbar */}

                  <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex flex-wrap items-center gap-4">

                     <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-1"><Filter size={16}/> Фільтр:</span>

                     <select 

                        value={teamFilterDept}

                        onChange={(e) => setTeamFilterDept(e.target.value)}

                        className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 focus:outline-none focus:border-kmmr-blue"

                     >

                        <option value="all">Всі учасники</option>

                        {departments.map(d => (

                           <option key={d.id} value={d.id}>{d.name}</option>

                        ))}

                     </select>

                     <div className="ml-auto text-sm text-gray-500 dark:text-gray-400 font-bold">

                        Всього: {teamMembers.filter(m => teamFilterDept === 'all' || m.department === teamFilterDept).length}

                     </div>

                  </div>



                 {isAddingTeam && (

                   <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl border border-kmmr-blue/20 dark:border-blue-500/20 mb-6 animate-fade-in-up">

                     {/* ... (Team Form) ... */}

                     <div className="flex justify-between items-start mb-6">

                        <h3 className="font-bold text-xl text-kmmr-blue dark:text-blue-400">Додати/Редагувати Члена Команди</h3>

                        <button onClick={() => setIsAddingTeam(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><XCircle size={24}/></button>

                     </div>

                     

                     <form onSubmit={handleSaveTeamMember} className="space-y-6">

                        {/* ... fields ... */}

                        <div className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-2">

                             <span className="text-sm font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1"><Languages size={16}/> Мова контенту:</span>

                             <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">

                                <button type="button" onClick={() => setTeamLang('uk')} className={`px-3 py-1 rounded-md text-sm font-bold transition-all ${teamLang === 'uk' ? 'bg-white dark:bg-gray-700 shadow text-kmmr-blue dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>UA</button>

                                <button type="button" onClick={() => setTeamLang('en')} className={`px-3 py-1 rounded-md text-sm font-bold transition-all ${teamLang === 'en' ? 'bg-white dark:bg-gray-700 shadow text-kmmr-blue dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>EN</button>

                             </div>

                        </div>



                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                           <div className="space-y-4">

                              {teamLang === 'uk' ? (

                                 <>

                                    <div>

                                       <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Ім'я та Прізвище (UA)</label>

                                       <input className="border dark:border-gray-700 p-2 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={newTeamMember.name || ''} onChange={e => setNewTeamMember({...newTeamMember, name: e.target.value})} required />

                                    </div>

                                    <div>

                                       <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Роль/Посада (UA)</label>

                                       <input className="border dark:border-gray-700 p-2 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={newTeamMember.role || ''} onChange={e => setNewTeamMember({...newTeamMember, role: e.target.value})} required />

                                    </div>

                                    <div>

                                       <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Коротка біографія/Цитата (UA)</label>

                                       <textarea className="border dark:border-gray-700 p-2 rounded w-full h-20 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={newTeamMember.bio || ''} onChange={e => setNewTeamMember({...newTeamMember, bio: e.target.value})} />

                                    </div>

                                    <div>

                                       <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Деталі (UA) - Кожен рядок це пункт</label>

                                       <textarea className="border dark:border-gray-700 p-2 rounded w-full h-24 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 dark:placeholder-gray-500" value={teamDetailsStr} onChange={e => setTeamDetailsStr(e.target.value)} placeholder="Вік: 20 років&#10;Навчання: КНУ&#10;Досвід: 2 роки"/>

                                    </div>

                                 </>

                              ) : (

                                 <>

                                    <div>

                                       <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Full Name (EN)</label>

                                       <input className="border dark:border-gray-700 p-2 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 dark:placeholder-gray-500" value={newTeamMember.nameEn || ''} onChange={e => setNewTeamMember({...newTeamMember, nameEn: e.target.value})} />

                                    </div>

                                    <div>

                                       <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Role (EN)</label>

                                       <input className="border dark:border-gray-700 p-2 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 dark:placeholder-gray-500" value={newTeamMember.roleEn || ''} onChange={e => setNewTeamMember({...newTeamMember, roleEn: e.target.value})} />

                                    </div>

                                    <div>

                                       <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Bio/Quote (EN)</label>

                                       <textarea className="border dark:border-gray-700 p-2 rounded w-full h-20 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 dark:placeholder-gray-500" value={newTeamMember.bioEn || ''} onChange={e => setNewTeamMember({...newTeamMember, bioEn: e.target.value})} />

                                    </div>

                                    <div>

                                       <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Details (EN) - Line separated</label>

                                       <textarea className="border dark:border-gray-700 p-2 rounded w-full h-24 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 dark:placeholder-gray-500" value={teamDetailsEnStr} onChange={e => setTeamDetailsEnStr(e.target.value)} />

                                    </div>

                                 </>

                              )}

                           </div>

                           

                           <div className="space-y-4">

                              <div>

                                 <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Департамент</label>

                                 <select 

                                   className="border dark:border-gray-700 p-2 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 dark:placeholder-gray-500" 

                                   value={newTeamMember.department || ''} 

                                   onChange={e => setNewTeamMember({...newTeamMember, department: e.target.value})}

                                   required

                                 >

                                    <option value="">Оберіть...</option>

                                    {departments.map(dept => (

                                       <option key={dept.id} value={dept.id}>{dept.name}</option>

                                    ))}

                                 </select>

                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                <div>

                                   <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Email</label>

                                   <input className="border dark:border-gray-700 p-2 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 dark:placeholder-gray-500" value={newTeamMember.email || ''} onChange={e => setNewTeamMember({...newTeamMember, email: e.target.value})} type="email" />

                                </div>

                                <div>

                                   <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Instagram Link</label>

                                   <input className="border dark:border-gray-700 p-2 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 dark:placeholder-gray-500" value={newTeamMember.instagram || ''} onChange={e => setNewTeamMember({...newTeamMember, instagram: e.target.value})} placeholder="https://instagram.com/..." />

                                </div>

                              </div>

                              <div className="border-2 border-dashed border-gray-300 p-4 rounded-xl text-center">

                                 <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Фото</label>

                                 <input type="file" onChange={e => setFileToUpload(e.target.files ? e.target.files[0] : null)} className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#D7269B]/10 file:text-[#D7269B] hover:file:bg-[#D7269B]/20 dark:file:bg-[#D7269B]/20 dark:file:text-[#D7269B] dark:hover:file:bg-[#D7269B]/30"/>

                              </div>

                           </div>

                        </div>



                        <div className="flex gap-4 pt-4 border-t border-gray-200">

                           <button type="submit" disabled={loading} className="bg-kmmr-green text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all w-full flex justify-center items-center gap-2">

                              {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />} Зберегти

                           </button>

                        </div>

                     </form>

                   </div>

                 )}



                 {/* Team Members List */}

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">

                    <div onClick={() => { setIsAddingTeam(true); setNewTeamMember({ details: [], detailsEn: [] }); setTeamDetailsStr(''); setTeamDetailsEnStr(''); setFileToUpload(null); }} className="bg-white dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center h-full min-h-[160px] p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">

                       <Plus className="w-8 h-8 text-kmmr-blue dark:text-blue-400" /><span className="font-bold text-gray-500 dark:text-gray-400 mt-2">Додати Учасника</span>

                    </div>



                    {teamMembers

                      .filter(m => teamFilterDept === 'all' || m.department === teamFilterDept)

                      .map((member, index) => {

                         const deptName = departments.find(d => d.id === member.department)?.name || member.department;

                         

                         return (

                            <div 

                               key={member.id}

                               draggable

                               onDragStart={() => handleDragStartMember(index)}

                               onDragOver={handleDragOver}

                               onDrop={() => handleDropMember(index)}

                               className={`bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm h-full flex flex-col justify-between gap-4 cursor-move transition-all ${draggedMemberIndex === index ? 'opacity-50 border-dashed border-kmmr-blue' : ''}`}

                            >

                               <div className="flex items-center gap-4">

                                  <div className="text-gray-300 dark:text-gray-600 hidden md:block"><GripVertical size={20}/></div>

                                  <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-800">

                                     <img src={member.image} alt="" className="w-full h-full object-cover"/>

                                  </div>

                                  <div className="flex-grow min-w-0">

                                     <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm">{member.name}</h4>

                                     <p className="text-xs text-gray-500 dark:text-gray-400">{member.role}</p>

                                     <span className="text-[10px] uppercase font-bold text-kmmr-blue dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded mt-1 inline-block">{deptName}</span>

                                  </div>

                               </div>

                               

                               <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-2 mt-2">

                                  <div className="flex gap-1">

                                     <button onClick={() => moveTeamMember(index, 'up')} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-400 hover:text-kmmr-blue"><ChevronUp size={16}/></button>

                                     <button onClick={() => moveTeamMember(index, 'down')} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-400 hover:text-kmmr-blue"><ChevronDown size={16}/></button>

                                  </div>

                                  <div className="flex gap-1">

                                     <button onClick={() => { 

                                        setNewTeamMember(member); 

                                        setTeamDetailsStr(member.details.join('\n')); 

                                        setTeamDetailsEnStr(member.detailsEn?.join('\n') || ''); 

                                        setIsAddingTeam(true); 

                                        window.scrollTo({top:0, behavior:'smooth'}); 

                                      }} className="p-1.5 text-kmmr-blue dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"><Edit2 size={16}/></button>

                                     <button type="button" data-no-dnd="true" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteMember(member.id); }} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors cursor-pointer z-50"><Trash2 size={16} className="text-red-500" /></button>

                                  </div>

                               </div>

                            </div>

                         );

                    })}

                 </div>

                </div>

             )}

           </div>

        )}



        {/* 6. PARTNERS MANAGER */}

        {activeTab === 'partners' && (

           <div className="space-y-6">

             {/* Toggle between Partner Types and Partners */}

             <div className="flex flex-col sm:flex-row gap-4 mb-4">

                <button 

                  onClick={() => setShowPartnerTypeManager(false)} 

                  className={`px-4 py-2 rounded-lg font-bold transition-all ${!showPartnerTypeManager ? 'bg-kmmr-blue text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}

                >

                  Партнери

                </button>

                <button 

                  onClick={() => setShowPartnerTypeManager(true)} 

                  className={`px-4 py-2 rounded-lg font-bold transition-all ${showPartnerTypeManager ? 'bg-kmmr-blue text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}

                >

                  Типи Партнерів

                </button>

             </div>



             {/* PARTNER TYPES MANAGER */}

             {showPartnerTypeManager ? (

               <div className="space-y-6">

                 {isAddingPartnerType && (

                    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl border border-kmmr-blue/20 dark:border-blue-500/20 mb-6 animate-fade-in-up">

                       <div className="flex justify-between items-start mb-6">

                          <h3 className="font-bold text-xl text-kmmr-blue dark:text-blue-400">Додати/Редагувати Тип Партнера</h3>

                          <button onClick={() => setIsAddingPartnerType(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><XCircle size={24}/></button>

                       </div>

                       <form onSubmit={handleSavePartnerType} className="space-y-6">

                          <div className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-2">

                             <span className="text-sm font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1"><Languages size={16}/> Мова контенту:</span>

                             <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">

                                <button type="button" onClick={() => setPartnerTypeLang('uk')} className={`px-3 py-1 rounded-md text-sm font-bold transition-all ${partnerTypeLang === 'uk' ? 'bg-white dark:bg-gray-700 shadow text-kmmr-blue dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>UA</button>

                                <button type="button" onClick={() => setPartnerTypeLang('en')} className={`px-3 py-1 rounded-md text-sm font-bold transition-all ${partnerTypeLang === 'en' ? 'bg-white dark:bg-gray-700 shadow text-kmmr-blue dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>EN</button>

                             </div>

                          </div>

                          

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                             <div className="space-y-4">

                                {partnerTypeLang === 'uk' ? (

                                   <>

                                      <div><label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Назва (UA)</label><input className="border dark:border-gray-700 p-2 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={newPartnerType.name || ''} onChange={e => setNewPartnerType({...newPartnerType, name: e.target.value})} required /></div>

                                      <div><label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Опис (UA)</label><textarea className="border dark:border-gray-700 p-2 rounded w-full h-24 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={newPartnerType.description || ''} onChange={e => setNewPartnerType({...newPartnerType, description: e.target.value})} /></div>

                                   </>

                                ) : (

                                   <>

                                      <div><label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Name (EN)</label><input className="border dark:border-gray-700 p-2 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={newPartnerType.nameEn || ''} onChange={e => setNewPartnerType({...newPartnerType, nameEn: e.target.value})} /></div>

                                      <div><label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Description (EN)</label><textarea className="border dark:border-gray-700 p-2 rounded w-full h-24 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={newPartnerType.descriptionEn || ''} onChange={e => setNewPartnerType({...newPartnerType, descriptionEn: e.target.value})} /></div>

                                   </>

                                )}

                             </div>

                             <div className="space-y-4">

                                <div>

                                   <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">Колір фону іконки</label>

                                   <div className="flex items-center gap-4">

                                      <input 

                                         type="color" 

                                         className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer p-0" 

                                         value={newPartnerType.color || '#031B47'} 

                                         onChange={e => setNewPartnerType({...newPartnerType, color: e.target.value})} 

                                      />

                                      <input 

                                         type="text" 

                                         className="border dark:border-gray-700 p-2 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" 

                                         value={newPartnerType.color || '#031B47'} 

                                         onChange={e => setNewPartnerType({...newPartnerType, color: e.target.value})} 

                                      />

                                   </div>

                                </div>

                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 p-4 rounded-xl text-center"><label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase block mb-2">Іконка (SVG/PNG)</label><input type="file" onChange={e => setFileToUpload(e.target.files ? e.target.files[0] : null)} className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#D7269B]/10 file:text-[#D7269B] hover:file:bg-[#D7269B]/20 dark:file:bg-[#D7269B]/20 dark:file:text-[#D7269B] dark:hover:file:bg-[#D7269B]/30"/></div>

                             </div>

                          </div>

                          <button type="submit" disabled={loading} className="bg-kmmr-green text-white px-6 py-3 rounded-lg font-bold w-full">{loading ? <Loader2 className="animate-spin inline"/> : <Save size={20} className="inline mr-2"/>} Зберегти Тип</button>

                       </form>

                    </div>

                 )}

                 

                 <div onClick={() => { setNewPartnerType({ color: '#031B47' }); setFileToUpload(null); setIsAddingPartnerType(true); }} className="bg-white dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 flex items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">

                     <Plus className="w-6 h-6 text-gray-400 mr-2" /><span className="font-bold text-gray-600 dark:text-gray-400">Додати Тип Партнера</span>

                 </div>



                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {partnerTypes.map((pt, index) => (

                       <div 

                          key={pt.id}

                          draggable

                          onDragStart={() => handleDragStartPartnerType(index)}

                          onDragOver={handleDragOver}

                          onDrop={() => handleDropPartnerType(index)}

                          className={`bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-start gap-4 cursor-move ${draggedPartnerTypeIndex === index ? 'opacity-50 border-dashed border-kmmr-blue' : ''}`}

                       >

                          <div className="mt-2 text-gray-300 dark:text-gray-600 hidden md:block"><GripVertical size={20}/></div>

                          <div style={{ backgroundColor: pt.color }} className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0">

                             {pt.icon && <img src={pt.icon} alt="" className="w-6 h-6 object-contain invert brightness-0 invert" style={{ filter: 'brightness(0) invert(1)' }} />}

                          </div>

                          <div className="flex-grow min-w-0">

                             <h4 className="font-bold text-gray-800 dark:text-gray-200">{pt.name}</h4>

                             <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{pt.description}</p>

                          </div>

                          <div className="flex flex-col gap-1 items-center">

                             <button onClick={() => moveItem(index, 'up', partnerTypes, setPartnerTypes, 'partner_types')} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-400 hover:text-kmmr-blue"><ChevronUp size={16}/></button>

                             <button onClick={() => moveItem(index, 'down', partnerTypes, setPartnerTypes, 'partner_types')} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-400 hover:text-kmmr-blue"><ChevronDown size={16}/></button>

                          </div>

                          <div className="flex flex-col gap-2">

                             <button onClick={() => { setNewPartnerType(pt); setIsAddingPartnerType(true); window.scrollTo({top:0, behavior:'smooth'}); }} className="p-1 text-kmmr-blue dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"><Edit2 size={16}/></button>

                             <button type="button" data-no-dnd="true" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeletePartnerType(pt.id); }} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors cursor-pointer z-50"><Trash2 size={16} className="text-red-500" /></button>

                          </div>

                       </div>

                    ))}

                 </div>

               </div>

             ) : (

               /* PARTNERS LIST MANAGER */

               <div className="space-y-6">

                 {/* Filter Toolbar */}

                 <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex flex-wrap items-center gap-4">

                     <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-1"><Filter size={16}/> Фільтр по типу:</span>

                     <select 

                        value={partnerFilterType}

                        onChange={(e) => setPartnerFilterType(e.target.value)}

                        className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 dark:text-white dark:bg-gray-800 focus:outline-none focus:border-kmmr-blue"

                     >

                        {partnerTypes.map(pt => (

                           <option key={pt.id} value={pt.id}>{pt.name}</option>

                        ))}

                     </select>

                     <div className="ml-auto text-sm text-gray-500 font-bold">

                        Всього: {partners.filter(p => p.type === partnerFilterType).length}

                     </div>

                 </div>



                 {isAddingPartner && (

                    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl border border-kmmr-blue/20 dark:border-blue-500/20 mb-6 animate-fade-in-up">

                       <div className="flex justify-between items-start mb-6">

                          <h3 className="font-bold text-xl text-kmmr-blue dark:text-blue-400">Додати/Редагувати Партнера</h3>

                          <button onClick={() => setIsAddingPartner(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><XCircle size={24}/></button>

                       </div>

                       <form onSubmit={handleSavePartner} className="space-y-6">

                          <div className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-2">

                             <span className="text-sm font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1"><Languages size={16}/> Мова контенту:</span>

                             <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">

                                <button type="button" onClick={() => setPartnerLang('uk')} className={`px-3 py-1 rounded-md text-sm font-bold transition-all ${partnerLang === 'uk' ? 'bg-white dark:bg-gray-700 shadow text-kmmr-blue dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>UA</button>

                                <button type="button" onClick={() => setPartnerLang('en')} className={`px-3 py-1 rounded-md text-sm font-bold transition-all ${partnerLang === 'en' ? 'bg-white dark:bg-gray-700 shadow text-kmmr-blue dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>EN</button>

                             </div>

                          </div>

                          

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                             <div className="space-y-4">

                                {partnerLang === 'uk' ? (

                                   <>

                                      <div><label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Назва (UA)</label><input className="border dark:border-gray-700 p-2 rounded w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" value={newPartner.name || ''} onChange={e => setNewPartner({...newPartner, name: e.target.value})} required /></div>

                                   </>

                                ) : (

                                   <>

                                      <div><label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Name (EN)</label><input className="border dark:border-gray-700 p-2 rounded w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" value={newPartner.nameEn || ''} onChange={e => setNewPartner({...newPartner, nameEn: e.target.value})} /></div>

                                   </>

                                )}

                                <div><label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Тип</label><select className="border dark:border-gray-700 p-2 rounded w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" value={newPartner.type || ''} onChange={e => setNewPartner({...newPartner, type: e.target.value})} required><option value="">Оберіть...</option>{partnerTypes.map(pt => <option key={pt.id} value={pt.id}>{pt.name}</option>)}</select></div>

                                <div><label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Посилання</label><input className="border dark:border-gray-700 p-2 rounded w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" value={newPartner.link || ''} onChange={e => setNewPartner({...newPartner, link: e.target.value})} placeholder="https://..." /></div>

                             </div>

                             <div className="space-y-4">

                                <div>

                                   <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">Колір фону логотипу</label>

                                   <div className="flex items-center gap-4">

                                      <input 

                                         type="color" 

                                         className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer p-0" 

                                         value={newPartner.bgColor || '#ffffff'} 

                                         onChange={e => setNewPartner({...newPartner, bgColor: e.target.value})} 

                                      />

                                      <input 

                                         type="text" 

                                         className="border dark:border-gray-700 p-2 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" 

                                         value={newPartner.bgColor || '#ffffff'} 

                                         onChange={e => setNewPartner({...newPartner, bgColor: e.target.value})} 

                                      />

                                   </div>

                                </div>

                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 p-4 rounded-xl text-center"><label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase block mb-2">Логотип (Фото)</label><input type="file" onChange={e => setFileToUpload(e.target.files ? e.target.files[0] : null)} className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#D7269B]/10 file:text-[#D7269B] hover:file:bg-[#D7269B]/20 dark:file:bg-[#D7269B]/20 dark:file:text-[#D7269B] dark:hover:file:bg-[#D7269B]/30"/></div>

                             </div>

                          </div>

                          <button type="submit" disabled={loading} className="bg-kmmr-green text-white px-6 py-3 rounded-lg font-bold w-full">{loading ? <Loader2 className="animate-spin inline"/> : <Save size={20} className="inline mr-2"/>} Зберегти Партнера</button>

                       </form>

                    </div>

                 )}



                 <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 items-stretch">

                    <div onClick={() => { setIsAddingPartner(true); setNewPartner({ bgColor: '#ffffff', link: '#', type: partnerFilterType }); setFileToUpload(null); }} className="bg-white dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center h-full min-h-[300px] cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">

                       <Plus className="w-8 h-8 text-kmmr-blue dark:text-blue-400" /><span className="font-bold text-gray-500 dark:text-gray-400 mt-2">Додати Партнера</span>

                    </div>

                    {partners.filter(p => p.type === partnerFilterType).map((partner, index) => (

                       <div 

                          key={partner.id}

                          draggable

                          onDragStart={() => handleDragStartPartner(index)}

                          onDragOver={handleDragOver}

                          onDrop={() => handleDropPartner(index)}

                          className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col cursor-move hover:shadow-md transition-all h-full overflow-hidden ${draggedPartnerIndex === index ? 'opacity-50 border-dashed border-kmmr-blue' : ''}`}

                       >

                          <div className="h-56 bg-gray-50 dark:bg-gray-800 flex items-center justify-center p-6 relative" style={{ backgroundColor: partner.bgColor }}>

                             <div className="absolute top-2 right-2 text-gray-300 dark:text-gray-500 hidden md:block z-10 bg-white/50 dark:bg-black/50 rounded p-0.5"><GripVertical size={16}/></div>

                             <img src={partner.image} alt="" className="w-full h-full object-contain"/>

                          </div>

                          

                          <div className="p-4 flex-grow flex flex-col">

                             {/* Обгортка для тексту, яка центрує його по вертикалі та горизонталі */}

                             <div className="flex-grow flex items-center justify-center pb-3 w-full">

                                <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm line-clamp-2 text-center">{partner.name}</h4>

                             </div>

                             

                             {/* Нижній блок з кнопками */}

                             <div className="w-full flex justify-between items-center border-t border-gray-100 dark:border-gray-800 pt-3">

                                <div className="flex gap-1">

                                   <button onClick={() => movePartner(index, 'up')} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-400 hover:text-kmmr-blue"><ChevronUp size={16}/></button>

                                   <button onClick={() => movePartner(index, 'down')} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-400 hover:text-kmmr-blue"><ChevronDown size={16}/></button>

                                </div>

                                <div className="flex gap-1">

                                   <button onClick={() => { setNewPartner(partner); setIsAddingPartner(true); window.scrollTo({top:0, behavior:'smooth'}); }} className="text-kmmr-blue dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-1 rounded"><Edit2 size={16}/></button>

                                   <button type="button" data-no-dnd="true" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeletePartner(partner.id); }} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors cursor-pointer z-50"><Trash2 size={16} className="text-red-500" /></button>

                                </div>

                             </div>

                          </div>

                       </div>

                    ))}

                 </div>

               </div>

             )}

           </div>

        )}



        {activeTab === 'donations' && (
          <div className="space-y-6 animate-fade-in-up">
             <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
               <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-bold text-kmmr-blue dark:text-white">Реквізити для підтримки</h3>
                 <button onClick={() => { setIsAddingDonation(!isAddingDonation); setNewDonation({ type: 'copy', color: 'bg-kmmr-blue' }); }} className="flex items-center gap-2 bg-kmmr-blue text-white px-4 py-2 rounded-lg hover:bg-blue-900 transition-colors">
                   {isAddingDonation ? <X size={20} /> : <Plus size={20} />}
                   <span className="hidden sm:inline">{isAddingDonation ? 'Скасувати' : 'Додати реквізит'}</span>
                 </button>
               </div>

               {isAddingDonation && (
                 <form onSubmit={async (e) => {
                   e.preventDefault();
                   try {
                     const data = { ...newDonation, order: donations.length };
                     if (newDonation.id) {
                       await updateDoc(doc(db, "donations", newDonation.id), data);
                     } else {
                       await addDoc(collection(db, "donations"), data);
                     }
                     setIsAddingDonation(false);
                     setNewDonation({ type: 'copy', color: 'bg-kmmr-blue' });
                   } catch (error) {
                     handleFirebaseError(error, 'збереження реквізиту');
                   }
                 }} className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border border-gray-100 dark:border-gray-600 mb-8 space-y-4">
                   
                   <div className="flex gap-4 mb-4">
                     <button type="button" onClick={() => setDonationLang('uk')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${donationLang === 'uk' ? 'bg-kmmr-blue text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'}`}>Українська</button>
                     <button type="button" onClick={() => setDonationLang('en')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${donationLang === 'en' ? 'bg-kmmr-blue text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'}`}>English</button>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {donationLang === 'uk' ? (
                       <div>
                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Назва (Укр) *</label>
                         <input required type="text" value={newDonation.label || ''} onChange={e => setNewDonation({...newDonation, label: e.target.value})} className="w-full p-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" placeholder="МоноБанк (Банка)" />
                       </div>
                     ) : (
                       <div>
                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Назва (En)</label>
                         <input type="text" value={newDonation.labelEn || ''} onChange={e => setNewDonation({...newDonation, labelEn: e.target.value})} className="w-full p-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" placeholder="Monobank (Jar)" />
                       </div>
                     )}
                     <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Значення (Лінк або Рахунок) *</label>
                       <input required type="text" value={newDonation.value || ''} onChange={e => setNewDonation({...newDonation, value: e.target.value})} className="w-full p-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" placeholder="https://... або UA0000..." />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Тип дії *</label>
                       <select required value={newDonation.type || 'copy'} onChange={e => setNewDonation({...newDonation, type: e.target.value as 'link'|'copy'})} className="w-full p-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                         <option value="copy">Копіювати (IBAN, Картка)</option>
                         <option value="link">Перейти за посиланням (Банка)</option>
                       </select>
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Іконка (Текст або Фото) *</label>
                       <div className="flex gap-2">
                         <input type="text" value={newDonation.icon || ''} onChange={e => setNewDonation({...newDonation, icon: e.target.value})} className="w-full p-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" placeholder="M, ₴, $, €" />
                         <div className="relative overflow-hidden shrink-0">
                           <input type="file" onChange={async (e) => {
                             if (e.target.files && e.target.files[0]) {
                               try {
                                 const url = await handleFileUpload(e.target.files[0], 'donations');
                                 setNewDonation({...newDonation, icon: url});
                               } catch (error) {
                                 handleFirebaseError(error, 'завантаження іконки');
                               }
                             }
                           }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                           <button type="button" className="p-2 border dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" title="Завантажити картинку">
                             <ImageIcon size={20} className="text-gray-600 dark:text-gray-300" />
                           </button>
                         </div>
                       </div>
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Колір фону іконки *</label>
                       <div className="flex items-center gap-4">
                         <input 
                           type="color" 
                           className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer p-0" 
                           value={newDonation.color?.startsWith('#') ? newDonation.color : '#000000'} 
                           onChange={e => setNewDonation({...newDonation, color: e.target.value})} 
                         />
                         <input 
                           type="text" 
                           className="border dark:border-gray-600 p-2 rounded-lg w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" 
                           value={newDonation.color || '#000000'} 
                           onChange={e => setNewDonation({...newDonation, color: e.target.value})} 
                           placeholder="#000000"
                         />
                       </div>
                     </div>
                   </div>
                   <div className="flex justify-end gap-2 mt-4">
                     <button type="button" onClick={() => { setIsAddingDonation(false); setNewDonation({ type: 'copy', color: 'bg-kmmr-blue' }); }} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg">Скасувати</button>
                     <button type="submit" className="flex items-center gap-2 bg-kmmr-green text-white px-6 py-2 rounded-lg hover:bg-green-600"><Save size={20} /> Зберегти</button>
                   </div>
                 </form>
               )}

               <div className="grid grid-cols-1 gap-4">
                 {donations.map((item, index) => (
                   <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-100 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                     <div 
                       className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shrink-0 ${!item.color?.startsWith('#') ? item.color : ''}`}
                       style={item.color?.startsWith('#') ? { backgroundColor: item.color } : {}}
                     >
                       {item.icon.startsWith('http') ? <img src={item.icon} alt="icon" className="w-6 h-6 object-contain" /> : item.icon}
                     </div>
                     <div className="flex-grow min-w-0">
                       <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">{item.label}</div>
                       <div className="font-mono text-gray-800 dark:text-white font-semibold truncate text-sm sm:text-base">{item.value}</div>
                     </div>
                     <div className="flex items-center gap-2">
                       <div className="flex flex-col gap-1 mr-2">
                         <button onClick={() => moveItem(index, 'up', donations, setDonations, 'donations')} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-400"><ChevronUp size={16}/></button>
                         <button onClick={() => moveItem(index, 'down', donations, setDonations, 'donations')} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-400"><ChevronDown size={16}/></button>
                       </div>
                       <button onClick={() => { setNewDonation(item); setIsAddingDonation(true); window.scrollTo({top:0, behavior:'smooth'}); }} className="p-2 text-kmmr-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"><Edit2 size={18}/></button>
                       <button onClick={() => handleDeleteDonation(item.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 size={18}/></button>
                     </div>
                   </div>
                 ))}
                 {donations.length === 0 && !isAddingDonation && (
                   <div className="text-center py-12 text-gray-500 dark:text-gray-400">Немає доданих реквізитів</div>
                 )}
               </div>
             </div>
          </div>
        )}

      </main>

    </div>

  );

};