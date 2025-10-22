import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
  CubeIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  HomeIcon,
  ArrowRightOnRectangleIcon,
  WrenchScrewdriverIcon,
  BeakerIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const FeedingRegistration = () => {
  const [feeding, setFeeding] = useState([]);
  const [tanks, setTanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingFeeding, setEditingFeeding] = useState(null);
  const [formData, setFormData] = useState({
    tankId: '',
    feedingDate: new Date().toISOString().split('T')[0],
    feedType: '',
    feedQuantity: '',
    feedUnit: 'kg',
    aerationTime: '',
    equipmentMaintenance: {
      pumps: false,
      aerators: false,
      filters: false,
      otherEquipment: ''
    },
    inputs: {
      lime: { quantity: '', unit: 'kg' },
      molasses: { quantity: '', unit: 'L' },
      probiotics: { quantity: '', unit: 'g' },
      otherInputs: []
    },
    waterExchange: {
      performed: false,
      volume: '',
      volumeUnit: 'L',
      reason: ''
    },
    responsible: '',
    notes: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeeding();
    fetchTanks();
  }, []);

  const fetchFeeding = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/feeding', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFeeding(response.data.feeding);
    } catch (error) {
      console.error('Error fetching feeding:', error);
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchTanks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/tanks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTanks(response.data.tanks);
    } catch (error) {
      console.error('Error fetching tanks:', error);
    }
  };

  const handleEdit = (feedingItem) => {
    setEditingFeeding(feedingItem);
    setFormData({
      tankId: feedingItem.tankId._id,
      feedingDate: feedingItem.feedingDate.split('T')[0],
      feedType: feedingItem.feedType,
      feedQuantity: feedingItem.feedQuantity,
      feedUnit: feedingItem.feedUnit,
      aerationTime: feedingItem.aerationTime,
      equipmentMaintenance: feedingItem.equipmentMaintenance || {
        pumps: false,
        aerators: false,
        filters: false,
        otherEquipment: ''
      },
      inputs: feedingItem.inputs || {
        lime: { quantity: '', unit: 'kg' },
        molasses: { quantity: '', unit: 'L' },
        probiotics: { quantity: '', unit: 'g' },
        otherInputs: []
      },
      waterExchange: feedingItem.waterExchange || {
        performed: false,
        volume: '',
        volumeUnit: 'L',
        reason: ''
      },
      responsible: feedingItem.responsible,
      notes: feedingItem.notes
    });
    setShowModal(true);
  };

  const handleDelete = async (feedingId) => {
    if (!window.confirm('Tem certeza que deseja excluir este registro de alimentação?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/feeding/${feedingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Registro de alimentação excluído com sucesso!');
      fetchFeeding();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Erro ao excluir registro de alimentação');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');

      if (editingFeeding) {
        // Update existing feeding
        await axios.put(`http://localhost:5000/api/feeding/${editingFeeding._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage('Registro de alimentação atualizado com sucesso!');
        setEditingFeeding(null);
        setShowModal(false);
      } else {
        // Create new feeding
        await axios.post('http://localhost:5000/api/feeding', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage('Registro de alimentação cadastrado com sucesso!');
        setShowModal(false);
      }

      setFormData({
        tankId: '',
        feedingDate: new Date().toISOString().split('T')[0],
        feedType: '',
        feedQuantity: '',
        feedUnit: 'kg',
        aerationTime: '',
        equipmentMaintenance: {
          pumps: false,
          aerators: false,
          filters: false,
          otherEquipment: ''
        },
        inputs: {
          lime: { quantity: '', unit: 'kg' },
          molasses: { quantity: '', unit: 'L' },
          probiotics: { quantity: '', unit: 'g' },
          otherInputs: []
        },
        waterExchange: {
          performed: false,
          volume: '',
          volumeUnit: 'L',
          reason: ''
        },
        responsible: '',
        notes: ''
      });
      fetchFeeding();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Erro ao salvar registro de alimentação');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      if (name.includes('.')) {
        const [parent, child] = name.split('.');
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: checked
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: checked
        }));
      }
    } else if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'inputs' && child.includes('[')) {
        // Handle array inputs
        const [arrayName, index, field] = child.split(/[\[\]]/).filter(Boolean);
        const arrayIndex = parseInt(index);
        setFormData(prev => {
          const newInputs = { ...prev.inputs };
          if (!newInputs[arrayName]) newInputs[arrayName] = [];
          if (!newInputs[arrayName][arrayIndex]) newInputs[arrayName][arrayIndex] = {};
          newInputs[arrayName][arrayIndex][field] = value;
          return {
            ...prev,
            inputs: newInputs
          };
        });
      } else {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const addOtherInput = () => {
    setFormData(prev => ({
      ...prev,
      inputs: {
        ...prev.inputs,
        otherInputs: [
          ...prev.inputs.otherInputs,
          { name: '', quantity: '', unit: '' }
        ]
      }
    }));
  };

  const removeOtherInput = (index) => {
    setFormData(prev => ({
      ...prev,
      inputs: {
        ...prev.inputs,
        otherInputs: prev.inputs.otherInputs.filter((_, i) => i !== index)
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <img src="/FAZENDA DE CAMARÕES.png" alt="Logo" className="h-8 w-8 rounded-full" />
                <span className="ml-2 text-xl font-semibold text-gray-900">Controle de Alimentação</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate('/tank-registration')}
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Tanques
              </button>
              <button
                onClick={() => navigate('/water-quality-registration')}
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Qualidade da Água
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Side Menu */}
      <div className="flex">
        <div className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-6">
            <nav className="space-y-2">
              <a
                href="/dashboard"
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
              >
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Dashboard
              </a>
              <a
                href="/tank-registration"
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
              >
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Cadastrar Tanque
              </a>
              <a
                href="/water-quality-registration"
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
              >
                <BeakerIcon className="mr-3 h-5 w-5" />
                Qualidade da Água
              </a>
              <a
                href="/feeding-registration"
                className="flex items-center px-4 py-2 text-sm font-medium bg-green-100 text-green-700 rounded-md"
              >
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Alimentação
              </a>
              <a
                href="/shrimp-registration"
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
              >
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Cadastrar Camarão
              </a>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Feeding List */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-green-500 flex items-center">
                  <svg className="mr-3 h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Registros de Alimentação
                </h2>
                <button
                  onClick={() => setShowModal(!showModal)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center"
                >
                  <PlusIcon className="mr-2 h-5 w-5" />
                  Cadastrar Alimentação
                </button>
              </div>

              {message && (
                <div className={`mb-4 p-4 rounded-lg ${message.includes('sucesso') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {message}
                </div>
              )}

              {fetchLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Carregando registros...</p>
                </div>
              ) : feeding.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <p className="mt-2 text-gray-600">Nenhum registro de alimentação cadastrado ainda.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanque</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo de Ração</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aeração (h/dia)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manutenção</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Troca de Água</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsável</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {feeding.map((item) => (
                        <tr key={item._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{new Date(item.feedingDate).toLocaleDateString('pt-BR')}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.tankId.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.feedType}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.feedQuantity} {item.feedUnit}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.aerationTime}h</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.equipmentMaintenance && (
                              <div className="flex flex-wrap gap-1">
                                {item.equipmentMaintenance.pumps && <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Bombas</span>}
                                {item.equipmentMaintenance.aerators && <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Aeradores</span>}
                                {item.equipmentMaintenance.filters && <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">Filtros</span>}
                                {item.equipmentMaintenance.otherEquipment && <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Outros</span>}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.waterExchange?.performed ? `${item.waterExchange.volume} ${item.waterExchange.volumeUnit}` : 'Não'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.responsible}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleEdit(item)}
                              className="text-indigo-600 hover:text-indigo-900 mr-4 flex items-center"
                            >
                              <PencilIcon className="mr-1 h-4 w-4" />
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="text-red-600 hover:text-red-900 flex items-center"
                            >
                              <TrashIcon className="mr-1 h-4 w-4" />
                              Excluir
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={() => setShowModal(false)}>
              <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white" onClick={(e) => e.stopPropagation()}>
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {editingFeeding ? 'Editar Registro de Alimentação' : 'Cadastrar Alimentação'}
                    </h2>
                    <button
                      onClick={() => setShowModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Tanque *</label>
                          <div className="relative">
                            <select
                              name="tankId"
                              required
                              value={formData.tankId}
                              onChange={handleChange}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
                            >
                              <option value="">Selecione um tanque</option>
                              {tanks.map((tank) => (
                                <option key={tank._id} value={tank._id}>
                                  {tank.name}
                                </option>
                              ))}
                            </select>
                            <CubeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Data da Alimentação *</label>
                          <div className="relative">
                            <input
                              type="date"
                              name="feedingDate"
                              required
                              value={formData.feedingDate}
                              onChange={handleChange}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                            <CalendarDaysIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Ração *</label>
                          <div className="relative">
                            <input
                              type="text"
                              name="feedType"
                              required
                              value={formData.feedType}
                              onChange={handleChange}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Ex: Ração comercial 35% PB"
                            />
                            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade *</label>
                            <input
                              type="number"
                              name="feedQuantity"
                              step="0.01"
                              min="0"
                              required
                              value={formData.feedQuantity}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="2.5"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Unidade</label>
                            <select
                              name="feedUnit"
                              value={formData.feedUnit}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                              <option value="kg">kg</option>
                              <option value="g">g</option>
                              <option value="lbs">lbs</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Tempo de Aeração (horas/dia) *</label>
                          <div className="relative">
                            <input
                              type="number"
                              name="aerationTime"
                              step="0.1"
                              min="0"
                              max="24"
                              required
                              value={formData.aerationTime}
                              onChange={handleChange}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="18.0"
                            />
                            <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Responsável *</label>
                          <div className="relative">
                            <input
                              type="text"
                              name="responsible"
                              required
                              value={formData.responsible}
                              onChange={handleChange}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Nome do responsável"
                            />
                            <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                      </div>

                      {/* Equipment Maintenance */}
                      <div className="border border-orange-200 bg-orange-50 p-6 rounded-lg">
                        <h3 className="text-md font-semibold text-orange-800 mb-4 flex items-center">
                          <WrenchScrewdriverIcon className="h-5 w-5 mr-2" />
                          Manutenção de Equipamentos
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              name="equipmentMaintenance.pumps"
                              checked={formData.equipmentMaintenance.pumps}
                              onChange={handleChange}
                              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">Bombas</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              name="equipmentMaintenance.aerators"
                              checked={formData.equipmentMaintenance.aerators}
                              onChange={handleChange}
                              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">Aeradores</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              name="equipmentMaintenance.filters"
                              checked={formData.equipmentMaintenance.filters}
                              onChange={handleChange}
                              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">Filtros</span>
                          </label>
                        </div>
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Outros Equipamentos</label>
                          <input
                            type="text"
                            name="equipmentMaintenance.otherEquipment"
                            value={formData.equipmentMaintenance.otherEquipment}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="Ex: Redes, válvulas, etc."
                          />
                        </div>
                      </div>

                      {/* Inputs */}
                      <div className="border border-blue-200 bg-blue-50 p-6 rounded-lg">
                        <h3 className="text-md font-semibold text-blue-800 mb-4 flex items-center">
                          <BeakerIcon className="h-5 w-5 mr-2" />
                          Insumos Utilizados
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cal (kg)</label>
                            <input
                              type="number"
                              name="inputs.lime.quantity"
                              step="0.01"
                              min="0"
                              value={formData.inputs.lime.quantity}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="0.5"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Melaço (L)</label>
                            <input
                              type="number"
                              name="inputs.molasses.quantity"
                              step="0.01"
                              min="0"
                              value={formData.inputs.molasses.quantity}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="2.0"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Probióticos (g)</label>
                            <input
                              type="number"
                              name="inputs.probiotics.quantity"
                              step="0.01"
                              min="0"
                              value={formData.inputs.probiotics.quantity}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="10.0"
                            />
                          </div>
                        </div>

                        {/* Other Inputs */}
                        <div className="mt-4">
                          <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700">Outros Insumos</label>
                            <button
                              type="button"
                              onClick={addOtherInput}
                              className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                            >
                              <PlusIcon className="h-4 w-4 mr-1" />
                              Adicionar
                            </button>
                          </div>
                          {formData.inputs.otherInputs.map((input, index) => (
                            <div key={index} className="flex gap-2 mb-2">
                              <input
                                type="text"
                                name={`inputs.otherInputs[${index}].name`}
                                value={input.name}
                                onChange={handleChange}
                                placeholder="Nome do insumo"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              <input
                                type="number"
                                name={`inputs.otherInputs[${index}].quantity`}
                                value={input.quantity}
                                onChange={handleChange}
                                placeholder="Quantidade"
                                step="0.01"
                                min="0"
                                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              <input
                                type="text"
                                name={`inputs.otherInputs[${index}].unit`}
                                value={input.unit}
                                onChange={handleChange}
                                placeholder="Unidade"
                                className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              <button
                                type="button"
                                onClick={() => removeOtherInput(index)}
                                className="text-red-600 hover:text-red-800 p-2"
                              >
                                <XMarkIcon className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Water Exchange */}
                      <div className="border border-cyan-200 bg-cyan-50 p-6 rounded-lg">
                        <h3 className="text-md font-semibold text-cyan-800 mb-4 flex items-center">
                          <ArrowPathIcon className="h-5 w-5 mr-2" />
                          Troca de Água
                        </h3>
                        <div className="flex items-center mb-4">
                          <input
                            type="checkbox"
                            name="waterExchange.performed"
                            checked={formData.waterExchange.performed}
                            onChange={handleChange}
                            className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">Troca de água realizada</span>
                        </div>
                        {formData.waterExchange.performed && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Volume</label>
                              <div className="flex gap-2">
                                <input
                                  type="number"
                                  name="waterExchange.volume"
                                  step="0.01"
                                  min="0"
                                  value={formData.waterExchange.volume}
                                  onChange={handleChange}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                  placeholder="100.0"
                                />
                                <select
                                  name="waterExchange.volumeUnit"
                                  value={formData.waterExchange.volumeUnit}
                                  onChange={handleChange}
                                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                >
                                  <option value="L">L</option>
                                  <option value="m³">m³</option>
                                  <option value="gal">gal</option>
                                </select>
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
                              <input
                                type="text"
                                name="waterExchange.reason"
                                value={formData.waterExchange.reason}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                placeholder="Ex: Manutenção preventiva"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                        <div className="relative">
                          <textarea
                            name="notes"
                            rows="3"
                            value={formData.notes}
                            onChange={handleChange}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                            placeholder="Observações adicionais sobre a alimentação..."
                          />
                          <DocumentTextIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        </div>
                      </div>

                      {/* Submit Button */}
                      <div className="flex justify-end space-x-4">
                        <button
                          type="button"
                          onClick={() => setShowModal(false)}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                          {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
                          {editingFeeding ? 'Atualizar' : 'Cadastrar'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedingRegistration;
