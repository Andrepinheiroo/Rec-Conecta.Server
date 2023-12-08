const Evento = require("../models/Evento")

//helpers
const getToken = require("../helpers/get-token")
const getUserByToken = require ("../helpers/get-user-by-token")
const ObjectId = require('mongoose').Types.ObjectId

module.exports = class EventoController{

    //criação do evento
    static async create (req,res) {
        const { name, description, categoria,  dataev, hora, endereco} = req.body

        const images = req.files

        const available = true



        //upload de imagem

        //validações
        if (!name) {
            res.status(422).json({ message: 'O nome é obrigatório!' })
            return
          }
      
          if (!description) {
            res.status(422).json({ message: 'A descrição é obrigatória!' })
            return
          }
      
          if (!categoria) {
            res.status(422).json({ message: 'A categoria é obrigatória!' })
            return
          }
      
          if (!dataev) {
            res.status(422).json({ message: 'A data é obrigatória!' })
            return
          }
      
          if (!hora) {
            res.status(422).json({ message: 'A hora é obrigatória!' })
            return
          }
          if (!endereco) {
            res.status(422).json({ message: 'A localização é obrigatória!' })
            return
          }
          if (images.length === 0) {
            res.status(422).json({ message: 'A imagem é obrigatória!' })
            return
          }


          //resgatando o criador do evento 
          const token = getToken(req)
          const user = await getUserByToken(token)


          //criando o evento
          const evento = new Evento({
            name,
            description,
            categoria,
            dataev, 
            hora,
            endereco,
            available,
            images:[],
            user:{
                _id: user._id,
                name: user.name,
                image: user.image,
                email: user.email,
            },
          })
            //percorrendo o array de images para altrar os metadados(nome)
            images.map((image) => {
            evento.images.push(image.filename)
          })

          try {
            //salvando o evento
            const newEvento = await evento.save()
            res.status(201).json({message: 'Evento cadastrado com sucesso!',newEvento})
            
          } catch (error) {
            res.status(500).json({message: error})
          }
      
    }

    //Filtros

    static async getAll(req,res) {
        const eventos = await Evento.find().sort('-createdAt')//filtrando os eventos (mais recentes)
        res.status(200).json({eventos: eventos,})

    }

    static async getAllUserEventos(req,res){
        //regatando o token do usúario
        const token = getToken(req)
        const user = await getUserByToken(token)

        const eventos = await Evento.find({'user._id': user._id}).sort('-createdAt');

        res.status(200).json({eventos,})
    }


    static async getAllUserPaticipantes(req, res) {
        //regatando o token do usúario
        const token = getToken(req)
        const user = await getUserByToken(token)

        const eventos = await Evento.find({'participante._id': user._id}).sort('-createdAt');

        res.status(200).json({ eventos,})
    }

    //id dos eventos

    //Verficação do id/url do evento
    static async getEventoById(req,res){
        const id = req.params.id
        
        //checando a validade do id
        if(!ObjectId.isValid(id)) {
            res.status(422).json({ message: 'ID inválido!' })
            return
        }

        //checando se o evento existe
        const evento = await Evento.findOne({_id: id})

        if(!evento) {
            res.status(404).json({message: 'Evento não encontrado!'})
        }

        res.status(200).json({
            evento: evento, 
        })   
    }

    //Deletando eventos

    static async removeEventoById(req,res) {
        const id = req.params.id

        //checando a validade do id
        if(!ObjectId.isValid(id)){
            res.status(422).json({message: 'Id inválido'})
            return
        }

        //checando se o evento existe
        const evento = await Evento.findOne({_id: id})

        if(!evento) {
            res.status(404).json({message: 'Evento não encontrado!'})
            return
        }
        //checagem se foi o usúario que criou o evento

        const token = getToken(req)
        const user = await getUserByToken(token)

        if (evento.user._id.toString() !== user._id.toString()) {
            res.status(404).json({
              message:'Houve um problema em processar sua solicitação, tente novamente mais tarde!',})
              return
        }


        //excluindo o evendo
        await Evento.findByIdAndDelete(id)
        res.status(200).json({ message: 'Evento removido com sucesso!'})
        
    }

    //atualizando informações do evento
    static async updateEvento(req, res) {

        const id = req.params.id

        const { name, description, categoria, dataev, hora, endereco,available} = req.body
        
        const images = req.files

        const updateData = {}

        //checando se o evento existe
        const evento = await Evento.findOne({_id: id})

        if(!evento) {
            res.status(404).json({message: 'Evento não encontrado!'})
            return
        }

         //checagem se foi o usúario que criou o evento

         const token = getToken(req)
         const user = await getUserByToken(token)
 
         if (evento.user._id.toString() !== user._id.toString()) {
            res.status(404).json({
              message:'Houve um problema em processar sua solicitação, tente novamente mais tarde!',}) 
              return    
        }

        //validações
        if (!name) {
            res.status(422).json({ message: 'O nome é obrigatório!' })
            return
          } else {
            updateData.name = name
          } 
      
          if (!description) {
            res.status(422).json({ message: 'A descrição é obrigatória!' })
            return
          } else {
            updateData.description = description
          } 
      
          if (!categoria) {
            res.status(422).json({ message: 'O categoria é obrigatória!' })
            return
          } else {
            updateData.categoria = categoria
          }

      
          if (!data) {
            res.status(422).json({ message: 'A data é obrigatória!' })
            return
          } else {
            updateData.dataev = dataev
          }

      
          if (!hora) {
            res.status(422).json({ message: 'A hora é obrigatória!' })
            return
          } else {
            updateData.hora = hora
          }

          if (!endereco) {
            res.status(422).json({ message: 'O  endereço é obrigatório!' })
            return
          } else {
            updateData.endereco = endereco
          }

          if (images.length === 0) {
            res.status(422).json({ message: 'A imagem é obrigatória!' })
            return
          } else {
            updateData.images = []
            images.map((image) => {
            updateData.images.push(image.filename)    
            })
          }

          await Evento.findByIdAndUpdate(id, updateData)
          res.status(200).json({ message: 'Evento atualizado!'})

    }

    //realizando inscrição no evento

    static async inscription(req, res) {

        const id = req.params.id

        //checando se o evento existe
        const evento = await Evento.findOne({_id: id})

        if(!evento) {
            res.status(404).json({message: 'Evento não encontrado!'})
            return
        }

         //checagem se foi o usúario que criou o evento

         const token = getToken(req)
         const user = await getUserByToken(token)
 
         if (evento.user._id.equals(user._id)) {
            res.status(422).json({
              message:'Você não pode se inscrever no próprio evento',}) 
              return    
        }

        //checagem se o usúario já esta inscrito no evento

        if(evento.participante) {
            if(evento.participante._id.equals(user._id)) {
                res.status(404).json({
                    message:'Você já está inscrito neste evento',}) 
                    return 
            }
        }
        
        //adicionando usúario a isncrição do evento
        evento.participante = {
            _id: user._id,
            name: user.name,
            image:user.image
        }

        await Evento.findByIdAndUpdate(id, evento)

        res.status(200).json({
            message: `inscrição realizada, para mais informações entre em contato com ${evento.user.name} pelo e-mail ${evento.user.email}`
        })
    }


    //concluindo evento 

    static async concludeEvento (req,res){
        const id = req.params.id 
        //checando se o evento existe
        const evento = await Evento.findOne({_id: id})

        if(!evento) {
            res.status(404).json({message: 'Evento não encontrado!'})
            return
        }
         //checagem se foi o usúario que criou o evento

         const token = getToken(req)
         const user = await getUserByToken(token)
 
         if (evento.user._id.toString() !== user._id.toString()) {
            res.status(422).json({
              message:'Houve um problema em processar sua solicitação, tente novamente mais tarde!',}) 
              return    
        }

        evento.available = false

        await Evento.findByIdAndUpdate(id,evento)
        res.status(200).json ({
            message: 'Evento finalizado com sucesso'
        })
    }

    static async pesquisarEvento(req, res) {
      const query = req.params.query; 
      if (!query) {
        res.status(400).json({ message: 'Valor de pesquisa não fornecido' });
        return;
      }
    
      try {
        const eventos = await Evento.find({ name: { $regex: new RegExp(query, 'i') } });
    
        res.status(200).json({ eventos });
      } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar evento', error });
      }
    }

}