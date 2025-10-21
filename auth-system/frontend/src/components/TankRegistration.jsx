import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
  CheckIcon,
  CubeIcon,
  ScaleIcon,
  ArrowsRightLeftIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  HomeIcon,
  ArrowRightOnRectangleIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';

const TankRegistration = () => {
  const [tanks, setTanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTank, setEditingTank] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    capacity: '',
    size: '',
    installationDate: '',
    expiryDate: '',
    feedingType: 'Natural',
    technicalResponsible: '',
    status: 'Ativo',
    notes: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchTanks();
  }, []);

  const fetchTanks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/tanks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTanks(response.data.tanks);
    } catch (error) {
      console.error('Error fetching tanks:', error);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleEdit = (tank) => {
    setEditingTank(tank);
    setFormData({
      name: tank.name,
      capacity: tank.capacity,
      size: tank.size,
      installationDate: tank.installationDate.split('T')[0],
      expiryDate: tank.expiryDate.split('T')[0],
      feedingType: tank.feedingType,
      technicalResponsible: tank.technicalResponsible,
      status: tank.status,
      notes: tank.notes
    });
    setShowModal(true);
  };

  const handleDelete = async (tankId) => {
    if (!window.confirm('Tem certeza que deseja excluir este tanque?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/tanks/${tankId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Tanque excluído com sucesso!');
      fetchTanks();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Erro ao excluir tanque');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');

      if (editingTank) {
        // Update existing tank
        await axios.put(`http://localhost:5000/api/tanks/${editingTank._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage('Tanque atualizado com sucesso!');
        setEditingTank(null);
        setShowModal(false);
      } else {
        // Create new tank
        await axios.post('http://localhost:5000/api/tanks', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage('Tanque cadastrado com sucesso!');
        setShowModal(false);
      }

      setFormData({
        name: '',
        capacity: '',
        size: '',
        installationDate: '',
        expiryDate: '',
        feedingType: 'Natural',
        technicalResponsible: '',
        status: 'Ativo',
        notes: ''
      });
      fetchTanks();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Erro ao salvar tanque');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
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
                <span className="ml-2 text-xl font-semibold text-gray-900">Controle de Tanque</span>
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
                onClick={() => navigate('/shrimp-registration')}
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Camarões
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
                className="flex items-center px-4 py-2 text-sm font-medium bg-orange-100 text-orange-700 rounded-md"
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
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Tank List */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-orange-500 flex items-center">
                  <CubeIcon className="mr-3 h-8 w-8 text-orange-500" />
                  Tanques Cadastrados
                </h2>
                <button
                  onClick={() => setShowModal(!showModal)}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center"
                >
                  <PlusIcon className="mr-2 h-5 w-5" />
                  Cadastrar Tanque
                </button>
              </div>

              {message && (
                <div className={`mb-4 p-4 rounded-lg ${message.includes('sucesso') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {message}
                </div>
              )}

              {fetchLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Carregando tanques...</p>
                </div>
              ) : tanks.length === 0 ? (
                <div className="text-center py-8">
                  <CubeIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-gray-600">Nenhum tanque cadastrado ainda.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacidade</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsável</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {tanks.map((tank) => (
                        <tr key={tank._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tank.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tank.capacity} L</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              tank.status === 'Ativo' ? 'bg-green-100 text-green-800' :
                              tank.status === 'Manutenção' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {tank.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tank.technicalResponsible}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleEdit(tank)}
                              className="text-indigo-600 hover:text-indigo-900 mr-4 flex items-center"
                            >
                              <PencilIcon className="mr-1 h-4 w-4" />
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(tank._id)}
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

            {/* Modal */}
            {showModal && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={() => setShowModal(false)}>
                <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white" onClick={(e) => e.stopPropagation()}>
                  <div className="mt-3">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {editingTank ? 'Editar Tanque' : 'Cadastrar Tanque'}
                      </h2>
                      <button
                        onClick={() => setShowModal(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Tanque *</label>
                          <div className="relative">
                            <input
                              type="text"
                              name="name"
                              required
                              value={formData.name}
                              onChange={handleChange}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                              placeholder="Ex: Tanque 01"
                            />
                            <CubeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Capacidade (Litros) *</label>
                          <div className="relative">
                            <input
                              type="number"
                              name="capacity"
                              step="0.1"
                              min="1"
                              required
                              value={formData.capacity}
                              onChange={handleChange}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                              placeholder="Ex: 1000"
                            />
                            <ScaleIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Tamanho (Metros) *</label>
                          <div className="relative">
                            <input
                              type="number"
                              name="size"
                              step="0.1"
                              min="0.1"
                              required
                              value={formData.size}
                              onChange={handleChange}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                              placeholder="Ex: 5.5"
                            />
                            <ArrowsRightLeftIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Alimentação *</label>
                          <div className="relative">
                            <select
                              name="feedingType"
                              required
                              value={formData.feedingType}
                              onChange={handleChange}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none"
                            >
                              <option value="Natural">Natural</option>
                              <option value="Artificial">Artificial</option>
                              <option value="Mista">Mista</option>
                            </select>
                            <HomeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Data de Instalação *</label>
                          <div className="relative">
                            <input
                              type="date"
                              name="installationDate"
                              required
                              value={formData.installationDate}
                              onChange={handleChange}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                            <CalendarDaysIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Data de Validade *</label>
                          <div className="relative">
                            <input
                              type="date"
                              name="expiryDate"
                              required
                              value={formData.expiryDate}
                              onChange={handleChange}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                            <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Responsável Técnico *</label>
                          <div className="relative">
                            <input
                              type="text"
                              name="technicalResponsible"
                              required
                              value={formData.technicalResponsible}
                              onChange={handleChange}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                              placeholder="Nome do responsável"
                            />
                            <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                          <div className="relative">
                            <select
                              name="status"
                              value={formData.status}
                              onChange={handleChange}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none"
                            >
                              <option value="Ativo">Ativo</option>
                              <option value="Inativo">Inativo</option>
                              <option value="Manutenção">Manutenção</option>
                            </select>
                            <CheckCircleIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          </div>
                        </div>
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
                            placeholder="Observações adicionais (opcional)"
                          ></textarea>
                          <DocumentTextIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        </div>
                      </div>

                      <div className="flex justify-end space-x-4">
                        <button
                          type="button"
                          onClick={() => {
                            setShowModal(false);
                            setEditingTank(null);
                            setFormData({
                              name: '',
                              capacity: '',
                              size: '',
                              installationDate: '',
                              expiryDate: '',
                              feedingType: 'Natural',
                              technicalResponsible: '',
                              status: 'Ativo',
                              notes: ''
                            });
                          }}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors duration-200 flex items-center"
                        >
                          <XMarkIcon className="mr-2 h-5 w-5" />
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                          <PlusIcon className="mr-2 h-5 w-5" />
                          {loading ? (editingTank ? 'Atualizando...' : 'Cadastrando...') : (editingTank ? 'Atualizar Tanque' : 'Cadastrar Tanque')}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  </div>  
  );
};

export default TankRegistration;
