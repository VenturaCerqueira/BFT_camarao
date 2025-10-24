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
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  HomeIcon,
  ArrowRightOnRectangleIcon,
  CurrencyDollarIcon,
  TagIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';

const ExpenseRegistration = () => {
  const [expenses, setExpenses] = useState([]);
  const [tanks, setTanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    tankId: '',
    expenseDate: '',
    category: 'Alimentação',
    description: '',
    amount: '',
    quantity: '',
    unit: 'kg',
    unitPrice: '',
    supplier: '',
    notes: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchExpenses();
    fetchTanks();
  }, []);

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/expenses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExpenses(response.data.expenses);
    } catch (error) {
      console.error('Error fetching expenses:', error);
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

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      tankId: expense.tankId._id,
      expenseDate: expense.expenseDate.split('T')[0],
      category: expense.category,
      description: expense.description,
      amount: expense.amount.toString(),
      quantity: expense.quantity.toString(),
      unit: expense.unit,
      unitPrice: expense.unitPrice.toString(),
      supplier: expense.supplier,
      notes: expense.notes
    });
    setShowModal(true);
  };

  const handleDelete = async (expenseId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta despesa?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/expenses/${expenseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Despesa excluída com sucesso!');
      fetchExpenses();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Erro ao excluir despesa');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');

      if (editingExpense) {
        // Update existing expense
        await axios.put(`http://localhost:5000/api/expenses/${editingExpense._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage('Despesa atualizada com sucesso!');
        setEditingExpense(null);
        setShowModal(false);
      } else {
        // Create new expense
        await axios.post('http://localhost:5000/api/expenses', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage('Despesa cadastrada com sucesso!');
        setShowModal(false);
      }

      setFormData({
        tankId: '',
        expenseDate: '',
        category: 'Alimentação',
        description: '',
        amount: '',
        quantity: '',
        unit: 'kg',
        unitPrice: '',
        supplier: '',
        notes: ''
      });
      fetchExpenses();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Erro ao salvar despesa');
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

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <Layout currentPage="expense-registration">
      <div className="space-y-8">
        {/* Expense List */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-green-500 flex items-center">
              <CurrencyDollarIcon className="mr-3 h-8 w-8 text-green-500" />
              Despesas Cadastradas
            </h2>
            <button
              onClick={() => setShowModal(!showModal)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center"
            >
              <PlusIcon className="mr-2 h-5 w-5" />
              Cadastrar Despesa
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
              <p className="mt-2 text-gray-600">Carregando despesas...</p>
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-8">
              <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-gray-600">Nenhuma despesa cadastrada ainda.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanque</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {expenses.map((expense) => (
                    <tr key={expense._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(expense.expenseDate)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{expense.tankId?.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{expense.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">{formatCurrency(expense.amount)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4 flex items-center"
                        >
                          <PencilIcon className="mr-1 h-4 w-4" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(expense._id)}
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
                    {editingExpense ? 'Editar Despesa' : 'Cadastrar Despesa'}
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Data da Despesa *</label>
                      <div className="relative">
                        <input
                          type="date"
                          name="expenseDate"
                          required
                          value={formData.expenseDate}
                          onChange={handleChange}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <CalendarDaysIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
                      <div className="relative">
                        <select
                          name="category"
                          required
                          value={formData.category}
                          onChange={handleChange}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
                        >
                          <option value="Alimentação">Alimentação</option>
                          <option value="Manutenção">Manutenção</option>
                          <option value="Energia">Energia</option>
                          <option value="Água">Água</option>
                          <option value="Produtos Químicos">Produtos Químicos</option>
                          <option value="Equipamentos">Equipamentos</option>
                          <option value="Mão de Obra">Mão de Obra</option>
                          <option value="Outros">Outros</option>
                        </select>
                        <TagIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
                      <div className="relative">
                        <input
                          type="text"
                          name="description"
                          required
                          value={formData.description}
                          onChange={handleChange}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Ex: Ração para camarão"
                        />
                        <DocumentTextIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Valor Total (R$) *</label>
                      <div className="relative">
                        <input
                          type="number"
                          name="amount"
                          step="0.01"
                          min="0"
                          required
                          value={formData.amount}
                          onChange={handleChange}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="0.00"
                        />
                        <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
                      <div className="relative">
                        <input
                          type="number"
                          name="quantity"
                          step="0.01"
                          min="0"
                          value={formData.quantity}
                          onChange={handleChange}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="1"
                        />
                        <ScaleIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Unidade</label>
                      <div className="relative">
                        <select
                          name="unit"
                          value={formData.unit}
                          onChange={handleChange}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
                        >
                          <option value="kg">kg</option>
                          <option value="g">g</option>
                          <option value="L">L</option>
                          <option value="mL">mL</option>
                          <option value="unidade">unidade</option>
                          <option value="pacote">pacote</option>
                          <option value="caixa">caixa</option>
                          <option value="saco">saco</option>
                        </select>
                        <HomeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preço Unitário (R$)</label>
                      <div className="relative">
                        <input
                          type="number"
                          name="unitPrice"
                          step="0.01"
                          min="0"
                          value={formData.unitPrice}
                          onChange={handleChange}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="0.00"
                        />
                        <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fornecedor</label>
                      <div className="relative">
                        <input
                          type="text"
                          name="supplier"
                          value={formData.supplier}
                          onChange={handleChange}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Nome do fornecedor"
                        />
                        <ShoppingBagIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
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
                        setEditingExpense(null);
                        setFormData({
                          tankId: '',
                          expenseDate: '',
                          category: 'Alimentação',
                          description: '',
                          amount: '',
                          quantity: '',
                          unit: 'kg',
                          unitPrice: '',
                          supplier: '',
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
                      className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      <PlusIcon className="mr-2 h-5 w-5" />
                      {loading ? (editingExpense ? 'Atualizando...' : 'Cadastrando...') : (editingExpense ? 'Atualizar Despesa' : 'Cadastrar Despesa')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ExpenseRegistration;
