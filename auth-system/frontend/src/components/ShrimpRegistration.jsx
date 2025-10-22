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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <img src="/FAZENDA DE CAMARÕES.png" alt="Logo" className="h-8 w-8 rounded-full" />
                <span className="ml-2 text-xl font-semibold text-gray-900">Controle de Camarão</span>
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
                href="/shrimp-registration"
                className="flex items-center px-4 py-2 text-sm font-medium bg-orange-100 text-orange-700 rounded-md"
              >
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Cadastrar Camarão
              </a>
              <a
                href="/feeding-registration"
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
              >
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Alimentação
              </a>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <>
            <div className="max-w-6xl mx-auto space-y-8">
              {/* Shrimp List */}
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-orange-500 flex items-center">
                    <CubeIcon className="mr-3 h-8 w-8 text-orange-500" />
                    Registros de Camarão
                  </h2>
                  <button
                    onClick={() => setShowModal(!showModal)}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center"
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
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanque</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo de Camarão</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Início</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dias de Vida</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Biometria (g)</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sobrevivência (%)</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FCR</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Densidade (ind/m²)</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sanidade</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {shrimp.map((item) => (
                          <tr key={item._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.tankId.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.shrimpType}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.startDate).toLocaleDateString('pt-BR')}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.daysOfLife} dias</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.biometria ? `${item.biometria} g` : '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.sobrevivencia ? `${item.sobrevivencia}%` : '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.fcr || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.densidadeEstocagem ? `${item.densidadeEstocagem} ind/m²` : '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.sanidade || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                item.status === 'Ativo' ? 'bg-green-100 text-green-800' :
                                item.status === 'Finalizado' ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {item.status}
                              </span>
                            </td>
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
          </>
        </div>
      </div>
    </div>
  );
};

export default ShrimpRegistration;
