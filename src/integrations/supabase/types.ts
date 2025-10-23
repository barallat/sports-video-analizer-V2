export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string
          auth_user_id: string
          nombre: string
          email: string
          role: 'admin' | 'coach' | 'athlete'
          club_name: string | null
          clave_club: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          auth_user_id: string
          nombre: string
          email: string
          role?: 'admin' | 'coach' | 'athlete'
          club_name?: string | null
          clave_club?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          auth_user_id?: string
          nombre?: string
          email?: string
          role?: 'admin' | 'coach' | 'athlete'
          club_name?: string | null
          clave_club?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_auth_user_id_fkey"
            columns: ["auth_user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      deportes: {
        Row: {
          id: string
          nombre: string
          descripcion: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre: string
          descripcion?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          descripcion?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      equipos: {
        Row: {
          id: string
          nombre: string
          deporte_id: string
          usuario_id: string
          entrenador: string | null
          categoria: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre: string
          deporte_id: string
          usuario_id: string
          entrenador?: string | null
          categoria?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          deporte_id?: string
          usuario_id?: string
          entrenador?: string | null
          categoria?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipos_deporte_id_fkey"
            columns: ["deporte_id"]
            isOneToOne: false
            referencedRelation: "deportes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          }
        ]
      }
      jugadores: {
        Row: {
          id: string
          equipo_id: string | null
          nombre: string
          fecha_nacimiento: string | null
          altura: number | null
          peso: number | null
          user_id: string
          clave_club: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          equipo_id?: string | null
          nombre: string
          fecha_nacimiento?: string | null
          altura?: number | null
          peso?: number | null
          user_id: string
          clave_club: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          equipo_id?: string | null
          nombre?: string
          fecha_nacimiento?: string | null
          altura?: number | null
          peso?: number | null
          user_id?: string
          clave_club?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jugadores_equipo_id_fkey"
            columns: ["equipo_id"]
            isOneToOne: false
            referencedRelation: "equipos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jugadores_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          }
        ]
      }
      posiciones: {
        Row: {
          id: string
          nombre: string
          descripcion: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre: string
          descripcion?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          descripcion?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      posicion_movimientos: {
        Row: {
          id: string
          posicion_id: string
          nombre_movimiento: string
          caracteristica_1: string | null
          caracteristica_2: string | null
          caracteristica_3: string | null
          caracteristica_4: string | null
          caracteristica_5: string | null
          caracteristica_6: string | null
          caracteristica_7: string | null
          descripcion_movimiento: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          posicion_id: string
          nombre_movimiento: string
          caracteristica_1?: string | null
          caracteristica_2?: string | null
          caracteristica_3?: string | null
          caracteristica_4?: string | null
          caracteristica_5?: string | null
          caracteristica_6?: string | null
          caracteristica_7?: string | null
          descripcion_movimiento?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          posicion_id?: string
          nombre_movimiento?: string
          caracteristica_1?: string | null
          caracteristica_2?: string | null
          caracteristica_3?: string | null
          caracteristica_4?: string | null
          caracteristica_5?: string | null
          caracteristica_6?: string | null
          caracteristica_7?: string | null
          descripcion_movimiento?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "posicion_movimientos_posicion_id_fkey"
            columns: ["posicion_id"]
            isOneToOne: false
            referencedRelation: "posiciones"
            referencedColumns: ["id"]
          }
        ]
      }
      analisis_videos: {
        Row: {
          id: string
          usuario_id: string
          deporte_id: string
          jugador_id: string
          posicion_movimiento_id: string
          equipo_id: string | null
          titulo: string
          descripcion: string | null
          url_video: string
          fecha_analisis: string
          duracion_segundos: number | null
          resultados_analisis: Json | null
          metadatos: Json | null
          comentarios: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          usuario_id: string
          deporte_id: string
          jugador_id: string
          posicion_movimiento_id: string
          equipo_id?: string | null
          titulo: string
          descripcion?: string | null
          url_video: string
          fecha_analisis?: string
          duracion_segundos?: number | null
          resultados_analisis?: Json | null
          metadatos?: Json | null
          comentarios?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          usuario_id?: string
          deporte_id?: string
          jugador_id?: string
          posicion_movimiento_id?: string
          equipo_id?: string | null
          titulo?: string
          descripcion?: string | null
          url_video?: string
          fecha_analisis?: string
          duracion_segundos?: number | null
          resultados_analisis?: Json | null
          metadatos?: Json | null
          comentarios?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "analisis_videos_deporte_id_fkey"
            columns: ["deporte_id"]
            isOneToOne: false
            referencedRelation: "deportes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analisis_videos_jugador_id_fkey"
            columns: ["jugador_id"]
            isOneToOne: false
            referencedRelation: "jugadores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analisis_videos_posicion_movimiento_id_fkey"
            columns: ["posicion_movimiento_id"]
            isOneToOne: false
            referencedRelation: "posicion_movimientos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analisis_videos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analisis_videos_equipo_id_fkey"
            columns: ["equipo_id"]
            isOneToOne: false
            referencedRelation: "equipos"
            referencedColumns: ["id"]
          }
        ]
      }
      usuario_deportes: {
        Row: {
          id: string
          usuario_id: string
          deporte_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          usuario_id: string
          deporte_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          usuario_id?: string
          deporte_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuario_deportes_deporte_id_fkey"
            columns: ["deporte_id"]
            isOneToOne: false
            referencedRelation: "deportes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuario_deportes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          }
        ]
      }
      jugador_posiciones: {
        Row: {
          id: string
          jugador_id: string
          posicion_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          jugador_id: string
          posicion_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          jugador_id?: string
          posicion_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jugador_posiciones_jugador_id_fkey"
            columns: ["jugador_id"]
            isOneToOne: false
            referencedRelation: "jugadores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jugador_posiciones_posicion_id_fkey"
            columns: ["posicion_id"]
            isOneToOne: false
            referencedRelation: "posiciones"
            referencedColumns: ["id"]
          }
        ]
      }
      jugador_equipos: {
        Row: {
          id: string
          jugador_id: string
          equipo_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          jugador_id: string
          equipo_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          jugador_id?: string
          equipo_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jugador_equipos_jugador_id_fkey"
            columns: ["jugador_id"]
            isOneToOne: false
            referencedRelation: "jugadores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jugador_equipos_equipo_id_fkey"
            columns: ["equipo_id"]
            isOneToOne: false
            referencedRelation: "equipos"
            referencedColumns: ["id"]
          }
        ]
      }
      entrenos: {
        Row: {
          id: string
          equipo_id: string
          user_id: string
          fecha: string
          hora: string
          lugar: string
          entrada: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          equipo_id: string
          user_id: string
          fecha: string
          hora: string
          lugar: string
          entrada?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          equipo_id?: string
          user_id?: string
          fecha?: string
          hora?: string
          lugar?: string
          entrada?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "entrenos_equipo_id_fkey"
            columns: ["equipo_id"]
            isOneToOne: false
            referencedRelation: "equipos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entrenos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'admin' | 'coach' | 'athlete'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
