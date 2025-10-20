import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const TankRegistration = () => {
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
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/tanks', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage('Tanque cadastrado com sucesso!');
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
    } catch (error) {
      setMessage(error.response?.data?.message || 'Erro ao cadastrar tanque');
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
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Cadastrar Tanque</h2>

              {message && (
                <div className={`mb-4 p-4 rounded-lg ${message.includes('sucesso') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Tanque *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Ex: Tanque 01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Capacidade (Litros) *</label>
                    <input
                      type="number"
                      name="capacity"
                      step="0.1"
                      min="1"
                      required
                      value={formData.capacity}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Ex: 1000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tamanho (Metros) *</label>
                    <input
                      type="number"
                      name="size"
                      step="0.1"
                      min="0.1"
                      required
                      value={formData.size}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Ex: 5.5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Alimentação *</label>
                    <select
                      name="feedingType"
                      required
                      value={formData.feedingType}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="Natural">Natural</option>
                      <option value="Artificial">Artificial</option>
                      <option value="Mista">Mista</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data de Instalação *</label>
                    <input
                      type="date"
                      name="installationDate"
                      required
                      value={formData.installationDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data de Validade *</label>
                    <input
                      type="date"
                      name="expiryDate"
                      required
                      value={formData.expiryDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Responsável Técnico *</label>
                    <input
                      type="text"
                      name="technicalResponsible"
                      required
                      value={formData.technicalResponsible}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Nome do responsável"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="Ativo">Ativo</option>
                      <option value="Inativo">Inativo</option>
                      <option value="Manutenção">Manutenção</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                  <textarea
                    name="notes"
                    rows="3"
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="Observações adicionais (opcional)"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Cadastrando...' : 'Cadastrar Tanque'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TankRegistration;
