import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from './shared/Layout';
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
  BeakerIcon
} from '@heroicons/react/24/outline';

const ShrimpRegistration = () => {
  const [shrimp, setShrimp] = useState([]);
  const [tanks, setTanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingShrimp, setEditingShrimp] = useState(null);
  const [formData, setFormData] = useState({
    tankId: '',
    shrimpType: '',
    startDate: '',
    daysOfLife: '',
    evaluationDate: '',
    biometria: '',
    sobrevivencia: '',
    fcr: '',
    densidadeEstocagem: '',
    sanidade: '',
    notes: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchShrimp();
    fetchTanks();
  }, []);

  const fetchShrimp = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/shrimp', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShrimp(response.data.shrimp);
    } catch (error) {
      console.error('Error fetching shrimp:', error);
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

  const handleEdit = (shrimpItem) => {
    setEditingShrimp(shrimpItem);
    setFormData({
      tankId: shrimpItem.tankId._id,
      shrimpType: shrimpItem.shrimpType,
      startDate: shrimpItem.startDate.split('T')[0],
      daysOfLife: shrimpItem.daysOfLife,
      evaluationDate: shrimpItem.evaluationDate.split('T')[0],
      biometria: shrimpItem.biometria || '',
      sobrevivencia: shrimpItem.sobrevivencia || '',
      fcr: shrimpItem.fcr || '',
      densidadeEstocagem: shrimpItem.densidadeEstocagem || '',
      sanidade: shrimpItem.sanidade || '',
      notes: shrimpItem.notes
    });
    setShowModal(true);
  };

  const handleDelete = async (shrimpId) => {
    if (!window.confirm('Tem certeza que deseja excluir este registro de camarão?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/shrimp/${shrimpId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Registro de camarão excluído com sucesso!');
      fetchShrimp();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Erro ao excluir registro de camarão');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');

      if (editingShrimp) {
        // Update existing shrimp
        await axios.put(`http://localhost:5000/api/shrimp/${editingShrimp._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage('Registro de camarão atualizado com sucesso!');
        setEditingShrimp(null);
        setShowModal(false);
      } else {
        // Create new shrimp
        await axios.post('http://localhost:5000/api/shrimp', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage('Registro de camarão cadastrado com sucesso!');
        setShowModal(false);
      }

      setFormData({
        tankId: '',
        shrimpType: '',
        startDate: '',
        daysOfLife: '',
        evaluationDate: '',
        biometria: '',
        sobrevivencia: '',
        fcr: '',
        densidadeEstocagem: '',
        sanidade: '',
        notes: ''
      });
      fetchShrimp();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Erro ao salvar registro de camarão');
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
    <Layout currentPage="shrimp-registration">
      <div className="space-y-8">
        {/* Shrimp List */}
        <div className="bg-gradient-to-br from-white via-orange-50 to-white p-8 rounded-2xl shadow-xl border border-orange-100 relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-200 to-transparent rounded-full opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-300 to-transparent rounded-full opacity-15"></div>

          <div className="relative z-10">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent flex items-center">
                <CubeIcon className="mr-4 h-10 w-10 text-orange-500" />
                Registros de Camarão
              </h2>
              <button
                onClick={() => setShowModal(!showModal)}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center shadow-md"
              >
                <PlusIcon className="mr-2 h-5 w-5" />
                Cadastrar Camarão
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
              <p className="mt-2 text-gray-600">Carregando registros...</p>
            </div>
          ) : shrimp.length === 0 ? (
            <div className="text-center py-8">
              <CubeIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-gray-600">Nenhum registro de camarão cadastrado ainda.</p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-orange-100">
              <table className="min-w-full divide-y divide-orange-100">
                <thead className="bg-gradient-to-r from-orange-50 to-orange-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-orange-700 uppercase tracking-wider">Tanque</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-orange-700 uppercase tracking-wider">Tipo de Camarão</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-orange-700 uppercase tracking-wider">Data Início</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-orange-700 uppercase tracking-wider">Dias de Vida</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-orange-700 uppercase tracking-wider">Biometria (g)</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-orange-700 uppercase tracking-wider">Sobrevivência (%)</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-orange-700 uppercase tracking-wider">FCR</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-orange-700 uppercase tracking-wider">Densidade (ind/m²)</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-orange-700 uppercase tracking-wider">Sanidade</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-orange-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-orange-700 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-orange-50">
                  {shrimp.map((item) => (
                    <tr key={item._id} className="hover:bg-gradient-to-r hover:from-orange-25 hover:to-orange-50 transition-all duration-300 transform hover:scale-[1.01]">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{item.tankId.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.shrimpType}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(item.startDate).toLocaleDateString('pt-BR')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.daysOfLife} dias</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.biometria ? `${item.biometria} g` : '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.sobrevivencia ? `${item.sobrevivencia}%` : '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.fcr || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.densidadeEstocagem ? `${item.densidadeEstocagem} ind/m²` : '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.sanidade || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full shadow-sm ${
                          item.status === 'Ativo' ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300' :
                          item.status === 'Finalizado' ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300' :
                          'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-800 mr-4 flex items-center transition-all duration-300 transform hover:scale-110"
                        >
                          <PencilIcon className="mr-1 h-4 w-4" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
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
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="mt-3">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingShrimp ? 'Editar Registro de Camarão' : 'Cadastrar Camarão'}
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
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none"
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Camarão *</label>
                      <div className="relative">
                        <input
                          type="text"
                          name="shrimpType"
                          required
                          value={formData.shrimpType}
                          onChange={handleChange}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="Ex: Litopenaeus vannamei"
                        />
                        <HomeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Data de Início *</label>
                      <div className="relative">
                        <input
                          type="date"
                          name="startDate"
                          required
                          value={formData.startDate}
                          onChange={handleChange}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                        <CalendarDaysIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Dias de Vida *</label>
                      <div className="relative">
                        <input
                          type="number"
                          name="daysOfLife"
                          min="1"
                          required
                          value={formData.daysOfLife}
                          onChange={handleChange}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="Ex: 120"
                        />
                        <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Data de Avaliação *</label>
                      <div className="relative">
                        <input
                          type="date"
                          name="evaluationDate"
                          required
                          value={formData.evaluationDate}
                          onChange={handleChange}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                        <CalendarDaysIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Biometria (g)</label>
                      <div className="relative">
                        <input
                          type="number"
                          name="biometria"
                          step="0.01"
                          value={formData.biometria}
                          onChange={handleChange}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="Ex: 15.5"
                        />
                        <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sobrevivência (%)</label>
                      <div className="relative">
                        <input
                          type="number"
                          name="sobrevivencia"
                          step="0.01"
                          value={formData.sobrevivencia}
                          onChange={handleChange}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="Ex: 85.5"
                        />
                        <CheckCircleIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">FCR</label>
                      <div className="relative">
                        <input
                          type="number"
                          name="fcr"
                          step="0.01"
                          value={formData.fcr}
                          onChange={handleChange}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="Ex: 1.2"
                        />
                        <CubeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Densidade de Estocagem (ind/m²)</label>
                      <div className="relative">
                        <input
                          type="number"
                          name="densidadeEstocagem"
                          step="0.01"
                          value={formData.densidadeEstocagem}
                          onChange={handleChange}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="Ex: 50.0"
                        />
                        <HomeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sanidade</label>
                      <div className="relative">
                        <select
                          name="sanidade"
                          value={formData.sanidade}
                          onChange={handleChange}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none"
                        >
                          <option value="">Selecione a sanidade</option>
                          <option value="Boa">Boa</option>
                          <option value="Regular">Regular</option>
                          <option value="Ruim">Ruim</option>
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
                        setEditingShrimp(null);
                        setFormData({
                          tankId: '',
                          shrimpType: '',
                          startDate: '',
                          daysOfLife: '',
                          evaluationDate: '',
                          biometria: '',
                          sobrevivencia: '',
                          fcr: '',
                          densidadeEstocagem: '',
                          sanidade: '',
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
                      {loading ? (editingShrimp ? 'Atualizando...' : 'Cadastrando...') : (editingShrimp ? 'Atualizar Registro' : 'Cadastrar Camarão')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
    )}

  </Layout>
  );
};

export default ShrimpRegistration;
