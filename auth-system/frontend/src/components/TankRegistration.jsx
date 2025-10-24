import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from './shared/Layout';
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
  BeakerIcon,
  CurrencyDollarIcon
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
    <Layout currentPage="tank-registration">
      <div className="space-y-8">
        {/* Tank List */}
        <div className="bg-gradient-to-br from-white via-orange-50 to-white p-8 rounded-2xl shadow-xl border border-orange-100 relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-200 to-transparent rounded-full opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-300 to-transparent rounded-full opacity-15"></div>

          <div className="relative z-10">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent flex items-center">
                <CubeIcon className="mr-4 h-10 w-10 text-orange-500" />
                Tanques Cadastrados
              </h2>
              <button
                onClick={() => setShowModal(!showModal)}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center shadow-md"
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
            <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-orange-100">
              <table className="min-w-full divide-y divide-orange-100">
                <thead className="bg-gradient-to-r from-orange-50 to-orange-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-orange-700 uppercase tracking-wider">Nome</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-orange-700 uppercase tracking-wider">Capacidade</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-orange-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-orange-700 uppercase tracking-wider">Responsável</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-orange-700 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-orange-50">
                  {tanks.map((tank) => (
                    <tr key={tank._id} className="hover:bg-gradient-to-r hover:from-orange-25 hover:to-orange-50 transition-all duration-300 transform hover:scale-[1.01]">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{tank.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{tank.capacity} L</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full shadow-sm ${
                          tank.status === 'Ativo' ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300' :
                          tank.status === 'Manutenção' ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300' :
                          'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300'
                        }`}>
                          {tank.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{tank.technicalResponsible}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(tank)}
                          className="text-blue-600 hover:text-blue-800 mr-4 flex items-center transition-all duration-300 transform hover:scale-110"
                        >
                          <PencilIcon className="mr-1 h-4 w-4" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(tank._id)}
                          className="text-red-600 hover:text-red-800 flex items-center transition-all duration-300 transform hover:scale-110"
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
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={() => setShowModal(false)}>
          <div className="relative top-20 mx-auto p-8 border w-11/12 max-w-4xl shadow-2xl rounded-2xl bg-gradient-to-br from-white via-orange-50 to-white border border-orange-100" onClick={(e) => e.stopPropagation()}>
            <div className="mt-3">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent flex items-center">
                  <CubeIcon className="mr-4 h-8 w-8 text-orange-500" />
                  {editingTank ? 'Editar Tanque' : 'Cadastrar Tanque'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 rounded-full hover:bg-gray-100"
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
                    className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center shadow-md"
                  >
                    <XMarkIcon className="mr-2 h-5 w-5" />
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-md"
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
    </Layout>
  );
};

export default TankRegistration;
